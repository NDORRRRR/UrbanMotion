const db = require('../config/db');

// API: /api/dashboard/stats
exports.getSellerStats = async (req, res) => {
    try {
        // Pastikan req.user ada (dari middleware)
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const sellerId = req.user.id;

        // Hitung Total Products
        const [products] = await db.query(
            'SELECT COUNT(*) as total FROM products WHERE seller_id = ?', 
            [sellerId]
        );

        // Hitung Total Orders (Order yang berisi produk seller ini)
        const [orders] = await db.query(
            `SELECT COUNT(DISTINCT o.id) as total 
             FROM orders o 
             JOIN order_items oi ON o.id = oi.order_id 
             JOIN products p ON oi.product_id = p.id 
             WHERE p.seller_id = ?`, 
            [sellerId]
        );

        // Hitung Revenue (Total pendapatan seller dari order yang 'completed')
        const [revenue] = await db.query(
            `SELECT SUM(oi.price * oi.quantity) as total 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             JOIN orders o ON oi.order_id = o.id
             WHERE p.seller_id = ? AND o.status = 'completed'`, 
            [sellerId]
        );

        res.json({
            totalProducts: products[0]?.total || 0,
            totalOrders: orders[0]?.total || 0,
            totalRevenue: revenue[0]?.total || 0
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// API: /api/dashboard/products
exports.getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const [rows] = await db.query(
            'SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC', 
            [sellerId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

// API: /api/dashboard/orders
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        // Ambil data order detail buat seller
        const [rows] = await db.query(
            `SELECT o.id, o.created_at, o.status, o.total_price, u.username as buyer_name
             FROM orders o
             JOIN users u ON o.user_id = u.id
             JOIN order_items oi ON o.id = oi.order_id
             JOIN products p ON oi.product_id = p.id
             WHERE p.seller_id = ?
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [sellerId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};