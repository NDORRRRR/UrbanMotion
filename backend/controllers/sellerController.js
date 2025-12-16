const db = require('../config/db');

exports.getMyOrders = async (req, res) => {
  const sellerId = req.user.id;
  
  try {
    const query = `
      SELECT 
        oi.id as order_item_id,
        oi.order_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,
        oi.size,
        oi.tracking_number,
        oi.shipping_status,
        p.name as product_name,
        o.shipping_address,
        o.payment_status,
        o.created_at as order_date,
        u.username as buyer_name,
        u.email as buyer_email
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE oi.seller_id = ?
      ORDER BY o.created_at DESC
    `;
    
    const [orders] = await db.query(query, [sellerId]);
    res.json(orders);
    
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ message: 'Gagal mengambil data pesanan.' });
  }
};

exports.updateShipping = async (req, res) => {
  const sellerId = req.user.id;
  const { orderItemId } = req.params;
  const { tracking_number, shipping_status } = req.body;
  
  try {
    const [check] = await db.query(
      'SELECT id FROM order_items WHERE id = ? AND seller_id = ?',
      [orderItemId, sellerId]
    );
    
    if (check.length === 0) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    await db.query(
      `UPDATE order_items 
       SET tracking_number = ?, shipping_status = ?
       WHERE id = ?`,
      [tracking_number, shipping_status, orderItemId]
    );
    
    res.json({ message: 'Status pengiriman berhasil diupdate!' });
    
  } catch (error) {
    console.error('Error updating shipping:', error);
    res.status(500).json({ message: 'Gagal update pengiriman.' });
  }
};