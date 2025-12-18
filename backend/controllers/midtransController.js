const crypto = require('crypto');
const db = require('../config/db');
require('dotenv').config();

exports.handleNotification = async (req, res) => {
    try {
        const { order_id, status_code, gross_amount, transaction_status, signature_key, fraud_status } = req.body;

        // 1. Verifikasi Signature Key (Keamanan)
        // Rumus: SHA512(order_id + status_code + gross_amount + ServerKey)
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const hashString = order_id + status_code + gross_amount + serverKey;
        const expectedSignature = crypto.createHash('sha512').update(hashString).digest('hex');

        if (signature_key !== expectedSignature) {
            console.error('Invalid Signature Key');
            return res.status(403).json({ message: 'Invalid Signature' });
        }

        console.log(`Midtrans Notification: Order ${order_id} Status ${transaction_status}`);

        // Midtrans mengirim order_id yang mungkin ada suffix (misal UM-123-456). 
        // Di checkoutController kita pakai format `UM-${Date.now()}-${userId}`. 
        // Jadi kita perlu ambil ID Order asli dari database berdasarkan string order_id ini.
        // Tapi tunggu, saat insert kita tidak simpan `UM-...` sebagai ID primary key (PK). Primary key `id` adalah integer Auto Increment.
        // Kita harus cek: apakah kita menyimpan String Order ID ini di database?
        // Cek `checkoutController`:
        // `midtransPayload.transaction_details.order_id = orderId` (String UM-...)
        // `INSERT INTO orders ...` -> PK adalah ID (1, 2, 3..).
        // MASALAH: Kita tidak menyimpan String Order ID (UM-...) di kolom terpisah di tabel `orders`.
        // Kita hanya punya `id` (int). 
        // SOLUSI: Kita harus menyimpan midtrans_order_id di tabel orders, ATAU kita parsing ID dari string jika formatnya konsisten.
        // Format: `UM-${Date.now()}-${userId}` -> TIDAK ada ID order database disitu karena order belum dibuat saat generate string.
        // TAPI saat insert `orders`, kita dapat `orderIdDb`.
        // Harusnya kita update `checkoutController` untuk simpan string ini, atau gunakan `orderIdDb` sebagai order_id midtrans.
        // Tapi `orderIdDb` baru ada SETELAH insert.
        // SOLUSI TERBAIK SKRG: Lihat `checkoutController` baris 19: `const orderId = 'UM-' + Date.now() + '-' + userId;`
        // Ini dikirim ke Midtrans. Kita tidak bisa recover Order ID Database (int) dari sini dengan mudah kecuali kita simpan di tabel.

        // ACTION: Saya akan tambahkan kolom `midtrans_order_id` di tabel `orders` agar bisa dicocokkan.
        // ATAU: Karena tabel sudah ada, saya cari order berdasarkan `user_id` dan `total_amount` dan `created_at`? Riskan.
        // LEBIH BAIK: Tambahkan kolom `midtrans_id` di tabel `orders`.

        // TAPI TUNGGU: Saya tidak boleh ubah schema drastis tanpa tool SQL.
        // Mari kita cek schema `orders` lagi. Ada `id`.
        // Bisakah kita gunakan `id` database sebagai order_id midtrans?
        // Masalahnya: Kita butuh `order_id` SEBELUM insert ke DB untuk payload Midtrans?
        // Tidak, kita bisa Insert dulu status pending -> Dapat ID (misal 10) -> Baru kirim ke Midtrans dengan order_id="ORDER-10".
        // Mari ubah `checkoutController` dulu agar alurnya: Insert DB -> Kirim Midtrans.

        // REVISI STRATEGI:
        // 1. Ubah `checkoutController` agar insert DB DULUAN.
        // 2. Gunakan ID database (misal "ORDER-15") sebagai parameter ke Midtrans.
        // 3. Update `midtransController` ini untuk parsing ID dari "ORDER-15".

        // SAYA AKAN TULIS CODE `midtransController` dengan asumsi order_id formatnya "ORDER-{db_id}".
        // Nanti langkah selanjutnya saya update `checkoutController`.

        // Parsing ID: "ORDER-15" -> ["ORDER", "15"]
        const idParts = order_id.split('-');
        const dbOrderId = idParts[1]; // Asumsi format "ORDER-{id}" atau "UM-{id}"

        let newStatus = 'pending';
        let dbStatus = 'pending';

        if (transaction_status === 'capture') {
            if (fraud_status === 'challenge') {
                newStatus = 'challenge';
            } else if (fraud_status === 'accept') {
                newStatus = 'paid';
                dbStatus = 'processing'; // Order status jadi processing/shipped nanti
            }
        } else if (transaction_status === 'settlement') {
            newStatus = 'paid';
            dbStatus = 'processing';
        } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
            newStatus = 'failed';
            dbStatus = 'cancelled';
        } else if (transaction_status === 'pending') {
            newStatus = 'pending';
            dbStatus = 'pending';
        }

        // Update Database
        if (newStatus === 'paid') {
            await db.query(`UPDATE orders SET payment_status = 'paid', order_status = 'processing' WHERE id = ?`, [dbOrderId]);
        } else if (newStatus === 'failed') {
            // Cek dulu status sebelumnya biar gak double restore stok
            const [existing] = await db.query(`SELECT payment_status, order_status FROM orders WHERE id = ?`, [dbOrderId]);
            if (existing.length > 0 && existing[0].payment_status !== 'failed' && existing[0].order_status !== 'cancelled') {

                await db.query(`UPDATE orders SET payment_status = 'failed', order_status = 'cancelled' WHERE id = ?`, [dbOrderId]);

                // RESTORE STOCK
                const [items] = await db.query(`SELECT product_id, quantity FROM order_items WHERE order_id = ?`, [dbOrderId]);
                for (const item of items) {
                    await db.query(`UPDATE products SET stock = stock + ? WHERE id = ?`, [item.quantity, item.product_id]);
                }
            }
        }

        res.status(200).json({ status: 'OK' });

    } catch (error) {
        console.error('Notification Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
