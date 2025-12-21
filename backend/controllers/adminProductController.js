const db = require('../config/db');

/**
 * Get pending products waiting for approval
 * GET /admin/products/pending
 */
exports.getPendingProducts = async (req, res) => {
    try {
        const [products] = await db.query(`
      SELECT 
        p.id, p.name, p.brand, p.price, p.description, p.stock, p.category, p.condition_status,
        p.moderation_status, p.created_at,
        u.username as seller_name,
        GROUP_CONCAT(pi.image_url) as images
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.moderation_status = 'pending' AND p.is_deleted = 0
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `);

        // Parse images
        const formatted = products.map(product => ({
            ...product,
            images: product.images ? product.images.split(',') : []
        }));

        res.json({
            success: true,
            products: formatted,
            total: formatted.length
        });
    } catch (error) {
        console.error('Get pending products error:', error);
        res.status(500).json({ message: 'Gagal mengambil data produk pending' });
    }
};

/**
 * Approve product
 * PUT /admin/products/:id/approve
 */
exports.approveProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;

        // Check if product exists
        const [products] = await db.query('SELECT id, name FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        // Approve product
        await db.query(`
      UPDATE products 
      SET moderation_status = 'approved', reviewed_by = ?, reviewed_at = NOW()
      WHERE id = ?
    `, [adminId, id]);

        res.json({
            success: true,
            message: `Produk "${products[0].name}" berhasil disetujui`
        });
    } catch (error) {
        console.error('Approve product error:', error);
        res.status(500).json({ message: 'Gagal menyetujui produk' });
    }
};

/**
 * Reject product
 * PUT /admin/products/:id/reject
 * Body: { reason: string }
 */
exports.rejectProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const adminId = req.user.id;

        if (!reason) {
            return res.status(400).json({ message: 'Alasan penolakan wajib diisi' });
        }

        // Check if product exists
        const [products] = await db.query('SELECT id, name FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        // Reject product
        await db.query(`
      UPDATE products 
      SET moderation_status = 'rejected', reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ?
      WHERE id = ?
    `, [adminId, reason, id]);

        res.json({
            success: true,
            message: `Produk "${products[0].name}" berhasil ditolak`
        });
    } catch (error) {
        console.error('Reject product error:', error);
        res.status(500).json({ message: 'Gagal menolak produk' });
    }
};

/**
 * Get all products with moderation status
 * GET /admin/products
 */
exports.getAllProducts = async (req, res) => {
    try {
        const { status } = req.query;
        let query = `
      SELECT 
        p.id, p.name, p.brand, p.price, p.stock, p.moderation_status, p.created_at,
        u.username as seller_name,
        admin.username as reviewer_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN users admin ON p.reviewed_by = admin.id
      WHERE p.is_deleted = 0
    `;
        const params = [];

        if (status) {
            query += ' AND p.moderation_status = ?';
            params.push(status);
        }

        query += ' ORDER BY p.created_at DESC';

        const [products] = await db.query(query, params);

        res.json({
            success: true,
            products,
            total: products.length
        });
    } catch (error) {
        console.error('Get all products error:', error);
        res.status(500).json({ message: 'Gagal mengambil data produk' });
    }
};
