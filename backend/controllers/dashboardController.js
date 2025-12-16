const db = require('../config/db');

// Get Seller Stats
exports.getSellerStats = async (req, res) => {
  const sellerId = req.user.id;
  
  try {
    // Total Products
    const [products] = await db.query(
      'SELECT COUNT(*) as total FROM products WHERE seller_id = ?',
      [sellerId]
    );

    // Total Orders
    const [orders] = await db.query(
      `SELECT COUNT(DISTINCT o.id) as total 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE oi.seller_id = ?`,
      [sellerId]
    );

    // Total Revenue
    const [revenue] = await db.query(
      `SELECT SUM(oi.price_at_purchase * oi.quantity) as total 
       FROM order_items oi 
       JOIN orders o ON oi.order_id = o.id
       WHERE oi.seller_id = ? AND o.payment_status = 'paid'`,
      [sellerId]
    );

    // Pending Orders
    const [pending] = await db.query(
      `SELECT COUNT(DISTINCT o.id) as total 
       FROM orders o 
       JOIN order_items oi ON o.id = oi.order_id 
       WHERE oi.seller_id = ? AND o.order_status = 'new'`,
      [sellerId]
    );

    res.json({
      totalProducts: products[0].total,
      totalOrders: orders[0].total,
      totalRevenue: revenue[0].total || 0,
      pendingOrders: pending[0].total
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get Seller's Products
exports.getSellerProducts = async (req, res) => {
  const sellerId = req.user.id;
  
  try {
    const query = `
      SELECT 
        p.*, 
        COALESCE(SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url), ',', 1), 'https://via.placeholder.com/300') AS image_url,
        COALESCE(SUM(oi.quantity), 0) as total_sold
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      WHERE p.seller_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `;
    
    const [rows] = await db.query(query, [sellerId]);
    res.json(rows);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil produk' });
  }
};

// Get Seller's Orders
exports.getSellerOrders = async (req, res) => {
  const sellerId = req.user.id;
  
  try {
    const query = `
      SELECT 
        o.id, o.user_id, o.total_amount, o.shipping_address,
        o.payment_status, o.order_status, o.created_at,
        u.username as customer_name, u.email as customer_email,
        GROUP_CONCAT(
          CONCAT(p.name, ' (', oi.quantity, 'x)')
          SEPARATOR ', '
        ) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN users u ON o.user_id = u.id
      WHERE oi.seller_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    const [rows] = await db.query(query, [sellerId]);
    res.json(rows);
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil pesanan' });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, brand, price, description, stock, sizes } = req.body;
  const sellerId = req.user.id;

  try {
    // Cek ownership
    const [product] = await db.query(
      'SELECT * FROM products WHERE id = ? AND seller_id = ?',
      [id, sellerId]
    );

    if (product.length === 0) {
      return res.status(403).json({ message: 'Tidak ada akses ke produk ini' });
    }

    await db.query(
      `UPDATE products 
       SET name = ?, brand = ?, price = ?, description = ?, stock = ?, sizes = ?
       WHERE id = ?`,
      [name, brand, price, description, stock, sizes, id]
    );

    res.json({ message: 'Produk berhasil diupdate!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update produk' });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  const sellerId = req.user.id;

  try {
    // Cek ownership
    const [product] = await db.query(
      'SELECT * FROM products WHERE id = ? AND seller_id = ?',
      [id, sellerId]
    );

    if (product.length === 0) {
      return res.status(403).json({ message: 'Tidak ada akses ke produk ini' });
    }

    await db.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Produk berhasil dihapus!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal hapus produk' });
  }
};

// Update Order Status
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sellerId = req.user.id;

  try {
    // Cek apakah seller punya item di order ini
    const [check] = await db.query(
      'SELECT * FROM order_items WHERE order_id = ? AND seller_id = ?',
      [id, sellerId]
    );

    if (check.length === 0) {
      return res.status(403).json({ message: 'Tidak ada akses ke order ini' });
    }

    await db.query(
      'UPDATE orders SET order_status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Status order diupdate!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal update status' });
  }
};