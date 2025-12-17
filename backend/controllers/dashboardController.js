const db = require('../config/db');

// ===== API: /api/dashboard/stats =====
exports.getSellerStats = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        const sellerId = req.user.id;

        // 1. Total Products milik seller
        const [products] = await db.query(
            'SELECT COUNT(*) as total FROM products WHERE seller_id = ?', 
            [sellerId]
        );

        // 2. Total Orders (Order items yang produknya milik seller ini)
        const [orders] = await db.query(
            `SELECT COUNT(DISTINCT oi.order_id) as total 
             FROM order_items oi 
             WHERE oi.seller_id = ?`, 
            [sellerId]
        );

        // 3. Total Revenue (Dari completed orders ONLY)
        const [revenue] = await db.query(
            `SELECT COALESCE(SUM(oi.price_at_purchase * oi.quantity), 0) as total 
             FROM order_items oi 
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.seller_id = ? AND o.payment_status = 'paid'`, 
            [sellerId]
        );

        // 4. Pending Orders (Status 'new' atau 'processing')
        const [pending] = await db.query(
            `SELECT COUNT(DISTINCT oi.order_id) as total 
             FROM order_items oi 
             JOIN orders o ON oi.order_id = o.id 
             WHERE oi.seller_id = ? AND o.order_status IN ('new', 'processing')`, 
            [sellerId]
        );

        res.json({
            totalProducts: products[0]?.total || 0,
            totalOrders: orders[0]?.total || 0,
            totalRevenue: revenue[0]?.total || 0,
            pendingOrders: pending[0]?.total || 0
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

// ===== API: /api/dashboard/products =====
exports.getSellerProducts = async (req, res) => {
    try {
        const sellerId = req.user.id;
        
        const query = `
            SELECT 
                p.*,
                COALESCE(SUBSTRING_INDEX(GROUP_CONCAT(pi.image_url), ',', 1), 
                         'https://via.placeholder.com/300') as image_url,
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
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error fetching products' });
    }
};

// ===== API: /api/dashboard/orders =====
exports.getSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user.id;
        
        const query = `
            SELECT 
                o.id,
                o.created_at,
                o.order_status,
                o.payment_status,
                o.total_amount,
                o.shipping_address,
                u.username as customer_name,
                u.email as customer_email,
                GROUP_CONCAT(
                    CONCAT(p.name, ' (x', oi.quantity, ')')
                    SEPARATOR ', '
                ) as items
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE oi.seller_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        const [rows] = await db.query(query, [sellerId]);
        res.json(rows);
        
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

// ===== 🆕 UPDATE PRODUCT =====
exports.updateProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const productId = req.params.id;
        const { name, brand, price, description, stock, sizes } = req.body;

        // Verify ownership
        const [check] = await db.query(
            'SELECT id FROM products WHERE id = ? AND seller_id = ?',
            [productId, sellerId]
        );

        if (check.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await db.query(
            `UPDATE products 
             SET name = ?, brand = ?, price = ?, description = ?, stock = ?, sizes = ?
             WHERE id = ?`,
            [name, brand, price, description, stock, sizes, productId]
        );

        res.json({ message: 'Product updated successfully!' });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Failed to update product' });
    }
};

// ===== 🆕 DELETE PRODUCT =====
exports.deleteProduct = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const productId = req.params.id;

        const [check] = await db.query(
            'SELECT id FROM products WHERE id = ? AND seller_id = ?',
            [productId, sellerId]
        );

        if (check.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await db.query('DELETE FROM products WHERE id = ?', [productId]);

        res.json({ message: 'Product deleted successfully!' });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Failed to delete product' });
    }
};

// ===== 🆕 UPDATE ORDER STATUS =====
exports.updateOrderStatus = async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orderId = req.params.id;
        const { status } = req.body;

        // Verify seller owns items in this order
        const [check] = await db.query(
            `SELECT DISTINCT oi.order_id 
             FROM order_items oi 
             WHERE oi.order_id = ? AND oi.seller_id = ?`,
            [orderId, sellerId]
        );

        if (check.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await db.query(
            'UPDATE orders SET order_status = ? WHERE id = ?',
            [status, orderId]
        );

        res.json({ message: 'Order status updated!' });

    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Failed to update order' });
    }
};