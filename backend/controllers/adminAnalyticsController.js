const db = require('../config/db');

/**
 * Get dashboard overview statistics
 * GET /admin/analytics/dashboard
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Get user stats
        const [userStats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as buyers,
        SUM(CASE WHEN role = 'seller' THEN 1 ELSE 0 END) as sellers,
        SUM(CASE WHEN banned_at IS NOT NULL THEN 1 ELSE 0 END) as banned
      FROM users
    `);

        // Get product stats
        const [productStats] = await db.query(`
      SELECT 
        COUNT(*) as total_products,
        SUM(CASE WHEN moderation_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN moderation_status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN moderation_status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM products WHERE is_deleted = 0
    `);

        // Get order stats
        const [orderStats] = await db.query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(CASE WHEN order_status = 'new' THEN 1 ELSE 0 END) as new_orders,
        SUM(CASE WHEN order_status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN order_status = 'shipped' THEN 1 ELSE 0 END) as shipped,
        SUM(CASE WHEN order_status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as total_revenue
      FROM orders
    `);

        // Get legit check stats
        const [legitCheckStats] = await db.query(`
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM legit_checks
    `);

        res.json({
            success: true,
            stats: {
                users: userStats[0],
                products: productStats[0],
                orders: orderStats[0],
                legit_checks: legitCheckStats[0]
            }
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Gagal mengambil statistik dashboard' });
    }
};

/**
 * Get revenue data (last 30 days)
 * GET /admin/analytics/revenue
 */
exports.getRevenueData = async (req, res) => {
    try {
        const [revenue] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as order_count,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as revenue
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

        res.json({
            success: true,
            revenue_data: revenue
        });
    } catch (error) {
        console.error('Get revenue data error:', error);
        res.status(500).json({ message: 'Gagal mengambil data revenue' });
    }
};

/**
 * Get user growth data (last 30 days)
 * GET /admin/analytics/users
 */
exports.getUserGrowthData = async (req, res) => {
    try {
        const [growth] = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM users
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

        res.json({
            success: true,
            user_growth: growth
        });
    } catch (error) {
        console.error('Get user growth data error:', error);
        res.status(500).json({ message: 'Gagal mengambil data pertumbuhan user' });
    }
};
