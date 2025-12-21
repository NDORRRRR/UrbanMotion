const db = require('../config/db');

/**
 * Get pending legit checks for review
 * GET /admin/legit-checks/pending
 */
exports.getPendingLegitChecks = async (req, res) => {
    try {
        const [checks] = await db.query(`
      SELECT 
        lc.id, lc.sneaker_name, lc.status, lc.created_at,
        u.id as user_id, u.username, u.email,
        GROUP_CONCAT(lci.image_url) as images
      FROM legit_checks lc
      JOIN users u ON lc.user_id = u.id
      LEFT JOIN legit_check_images lci ON lc.id = lci.legit_check_id
      WHERE lc.status = 'pending'
      GROUP BY lc.id
      ORDER BY lc.created_at ASC
    `);

        // Parse images from string to array
        const formatted = checks.map(check => ({
            ...check,
            images: check.images ? check.images.split(',') : []
        }));

        res.json({
            success: true,
            legit_checks: formatted,
            total: formatted.length
        });
    } catch (error) {
        console.error('Get pending legit checks error:', error);
        res.status(500).json({ message: 'Gagal mengambil data legit check' });
    }
};

/**
 * Review legit check (approve/reject)
 * PUT /admin/legit-checks/:id/review
 * Body: { result: 'verified'|'fake'|'inconclusive', notes: string }
 */
exports.reviewLegitCheck = async (req, res) => {
    try {
        const { id } = req.params;
        const { result, notes } = req.body;
        const adminId = req.user.id;

        // Validate result
        const validResults = ['verified', 'fake', 'inconclusive'];
        if (!validResults.includes(result)) {
            return res.status(400).json({
                message: 'Result tidak valid. Pilih: verified, fake, atau inconclusive'
            });
        }

        if (!notes || notes.trim().length === 0) {
            return res.status(400).json({
                message: 'Catatan review wajib diisi'
            });
        }

        // Check if legit check exists
        const [checks] = await db.query('SELECT id FROM legit_checks WHERE id = ?', [id]);
        if (checks.length === 0) {
            return res.status(404).json({ message: 'Legit check tidak ditemukan' });
        }

        // Update legit check
        await db.query(`
      UPDATE legit_checks 
      SET status = 'completed', result = ?, reviewer_notes = ?, reviewed_by = ?, reviewed_at = NOW()
      WHERE id = ?
    `, [result, notes, adminId, id]);

        res.json({
            success: true,
            message: `Legit check berhasil di-review dengan hasil: ${result}`
        });
    } catch (error) {
        console.error('Review legit check error:', error);
        res.status(500).json({ message: 'Gagal mereview legit check' });
    }
};

/**
 * Get legit check statistics
 * GET /admin/legit-checks/stats
 */
exports.getLegitCheckStats = async (req, res) => {
    try {
        const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_checks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END) as in_review,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN result = 'verified' THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN result = 'fake' THEN 1 ELSE 0 END) as fake,
        SUM(CASE WHEN result = 'inconclusive' THEN 1 ELSE 0 END) as inconclusive
      FROM legit_checks
    `);

        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Get legit check stats error:', error);
        res.status(500).json({ message: 'Gagal mengambil statistik legit check' });
    }
};

/**
 * Get all legit checks with details
 * GET /admin/legit-checks
 */
exports.getAllLegitChecks = async (req, res) => {
    try {
        const { status, result } = req.query;
        let query = `
      SELECT 
        lc.id, lc.sneaker_name, lc.status, lc.result, lc.created_at, lc.reviewed_at, lc.reviewer_notes,
        u.username as user_name,
        admin.username as reviewer_name,
        GROUP_CONCAT(lci.image_url) as images
      FROM legit_checks lc
      JOIN users u ON lc.user_id = u.id
      LEFT JOIN users admin ON lc.reviewed_by = admin.id
      LEFT JOIN legit_check_images lci ON lc.id = lci.legit_check_id
      WHERE 1=1
    `;
        const params = [];

        if (status) {
            query += ' AND lc.status = ?';
            params.push(status);
        }

        if (result) {
            query += ' AND lc.result = ?';
            params.push(result);
        }

        query += ' GROUP BY lc.id ORDER BY lc.created_at DESC';

        const [checks] = await db.query(query, params);

        // Parse images
        const formatted = checks.map(check => ({
            ...check,
            images: check.images ? check.images.split(',') : []
        }));

        res.json({
            success: true,
            legit_checks: formatted,
            total: formatted.length
        });
    } catch (error) {
        console.error('Get all legit checks error:', error);
        res.status(500).json({ message: 'Gagal mengambil data legit check' });
    }
};
