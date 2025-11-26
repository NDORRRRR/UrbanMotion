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
            oi.*, p.name, 
            -- Ambil 1 gambar saja untuk thumbnail
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