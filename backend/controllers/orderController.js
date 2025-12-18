const db = require('../config/db');

exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const [items] = await db.query(
        `SELECT 
            oi.*, 
            oi.tracking_number,
            oi.shipping_status,
            p.name, 
            SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url), ',', 1) AS image_url 
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         LEFT JOIN product_images pi ON p.id = pi.product_id 
         WHERE oi.order_id = ?
         GROUP BY oi.id`,
        [order.id]
      );
      return { ...order, items };
    }));

    res.json(ordersWithItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil riwayat order.' });
  }
};

exports.confirmOrderItem = async (req, res) => {
  const { id } = req.params; // order_items.id
  const userId = req.user.id; // From auth middleware

  try {
    // Validasi: Pastikan item milik user
    const [rows] = await db.query(
      `SELECT oi.id 
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.id = ? AND o.user_id = ?`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Item tidak ditemukan atau bukan milik Anda.' });
    }

    // Update status
    await db.query(
      `UPDATE order_items SET shipping_status = 'delivered' WHERE id = ?`,
      [id]
    );

    // Cek apakah SEMUA item dalam order ini sudah delivered
    // Ambil order_id dari item ini dulu (kita bisa query ulang atau ambil dari join sebelumnya jika diubah)
    // Query ulang biar aman
    const [itemData] = await db.query('SELECT order_id FROM order_items WHERE id = ?', [id]);
    const orderId = itemData[0].order_id;

    const [items] = await db.query(
      `SELECT count(*) as total, 
              sum(case when shipping_status = 'delivered' then 1 else 0 end) as delivered_count 
       FROM order_items WHERE order_id = ?`,
      [orderId]
    );

    const { total, delivered_count } = items[0];

    // Jika semua delivered, update order status jadi delivered
    if (Number(delivered_count) === Number(total)) {
      await db.query(`UPDATE orders SET order_status = 'delivered' WHERE id = ?`, [orderId]);
    }

    res.json({ message: 'Pesanan berhasil dikonfirmasi!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal konfirmasi pesanan.' });
  }
};

exports.cancelOrder = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    // 1. Cek order milik user dan status masih bisa dicancel (new/pending)
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [id, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order tidak ditemukan.' });
    }

    const order = orders[0];
    if (order.payment_status !== 'pending' && order.order_status !== 'new') {
      return res.status(400).json({ message: 'Order sudah diproses atau dibayar, tidak bisa dibatalkan disini.' });
    }

    // 2. Update status order jadi cancelled
    await db.query(
      `UPDATE orders SET order_status = 'cancelled', payment_status = 'cancel' WHERE id = ?`,
      [id]
    );

    // 3. Kembalikan stok
    // Ambil item dari order ini
    const [items] = await db.query(
      `SELECT product_id, quantity FROM order_items WHERE order_id = ?`,
      [id]
    );

    for (const item of items) {
      await db.query(
        `UPDATE products SET stock = stock + ? WHERE id = ?`,
        [item.quantity, item.product_id]
      );
    }

    res.json({ message: 'Order berhasil dibatalkan dan stok dikembalikan.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membatalkan order.' });
  }
};