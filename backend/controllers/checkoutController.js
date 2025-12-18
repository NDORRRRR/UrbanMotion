const axios = require('axios');
const db = require('../config/db');
require('dotenv').config();

const MIDTRANS_URL = 'https://app.sandbox.midtrans.com/snap/v1/transactions';

const MIDTRANS_AUTH = Buffer.from(process.env.MIDTRANS_SERVER_KEY + ':').toString('base64');

exports.createTransaction = async (req, res) => {
  const userId = req.user.id;
  const { shipping_address, payment_method, total_amount, items } = req.body;

  // Validasi
  if (!items || items.length === 0 || !shipping_address) {
    return res.status(400).json({ message: 'Keranjang dan alamat pengiriman wajib diisi.' });
  }

  // 1. Simpan Order ke Database TERLEBIH DAHULU untuk mendapatkan ID
  try {
    const [orderResult] = await db.query(
      `INSERT INTO orders (user_id, total_amount, shipping_address, payment_method, payment_status, order_status) 
         VALUES (?, ?, ?, ?, 'pending', 'new')`,
      [userId, total_amount, shipping_address, payment_method]
    );
    const orderIdDb = orderResult.insertId;

    // 2. Gunakan ID Database untuk Order ID Midtrans (Format: ORDER-{id})
    const midtransOrderId = `ORDER-${orderIdDb}`;

    const midtransPayload = {
      transaction_details: {
        order_id: midtransOrderId,
        gross_amount: Math.round(total_amount),
      },
      credit_card: {
        secure: true,
      },
      item_details: items.map(item => ({
        id: String(item.product_id),
        price: Math.round(item.price),
        quantity: item.quantity,
        name: item.name.substring(0, 50),
      })),
      customer_details: {
        first_name: req.user.username,
        email: req.user.email,
        shipping_address: {
          address: shipping_address
        }
      }
    };

    const response = await axios.post(MIDTRANS_URL, midtransPayload, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${MIDTRANS_AUTH}`
      }
    });

    // Ambil Token dari respons Midtrans
    const snapToken = response.data.token;
    console.log("Snap Token Berhasil:", snapToken);

    // Update kolom (jika ada) atau biarkan saja karena relasi sudah terbentuk via ID
    // Kita tidak perlu update order_id midtrans ke DB jika kita konsisten pakai format ORDER-{id}

    // Simpan Detail Item
    for (const item of items) {
      // Auto-generate Resi
      const trackingNumber = 'JP-' + Math.floor(100000 + Math.random() * 900000);

      await db.query(
        `INSERT INTO order_items (order_id, product_id, seller_id, quantity, price_at_purchase, size, tracking_number, shipping_status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [orderIdDb, item.product_id, item.seller_id, item.quantity, item.price, item.size, trackingNumber]
      );
    }

    for (const item of items) {
      await db.query(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Clear cart after successful order
    await db.query('DELETE FROM carts WHERE user_id = ?', [userId]);

    res.json({
      message: 'Order dibuat, siap bayar!',
      snap_token: snapToken,
      orderId: orderIdDb
    });

  } catch (error) {
    console.error('Error Midtrans:', error.response ? error.response.data : error.message);
    res.status(500).json({ message: 'Gagal memproses pembayaran. Cek log server.' });
  }
};