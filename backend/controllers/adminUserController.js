const db = require('../config/db');

/**
 * Get all users with filters
 * Query params: role, search, banned
 */
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search, banned } = req.query;
        let query = `
      SELECT id, username, email, role, full_name, phone, created_at, banned_at, ban_reason
      FROM users 
      WHERE 1=1
    `;
        const params = [];

        // Filter by role
        if (role && role !== 'all') {
            query += ' AND role = ?';
            params.push(role);
        }

        // Filter by banned status
        if (banned === 'true') {
            query += ' AND banned_at IS NOT NULL';
        } else if (banned === 'false') {
            query += ' AND banned_at IS NULL';
        }

        // Search by username or email
        if (search) {
            query += ' AND (username LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' ORDER BY created_at DESC';

        const [users] = await db.query(query, params);

        res.json({
            success: true,
            users,
            total: users.length
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Gagal mengambil data users' });
    }
};

/**
 * Change user role
 * PUT /admin/users/:id/role
 * Body: { role: 'user'|'seller'|'admin' }
 */
exports.changeUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const adminId = req.user.id;

        // Validate role
        const validRoles = ['user', 'seller', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                message: 'Role tidak valid. Pilih: user, seller, atau admin'
            });
        }

        // Prevent self role change
        if (parseInt(id) === adminId) {
            return res.status(403).json({
                message: 'Anda tidak dapat mengubah role Anda sendiri'
            });
        }

        // Check if user exists
        const [users] = await db.query('SELECT id, username FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        // Update role
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);

        res.json({
            success: true,
            message: `Role user ${users[0].username} berhasil diubah menjadi ${role}`
        });
    } catch (error) {
        console.error('Change role error:', error);
        res.status(500).json({ message: 'Gagal mengubah role user' });
    }
};

/**
 * Ban/Unban user
 * PUT /admin/users/:id/ban
 * Body: { banned: true|false, reason?: string }
 */
exports.banUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { banned, reason } = req.body;
        const adminId = req.user.id;

        // Prevent self ban
        if (parseInt(id) === adminId) {
            return res.status(403).json({
                message: 'Anda tidak dapat mem-ban diri sendiri'
            });
        }

        // Check if user exists
        const [users] = await db.query('SELECT id, username FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        if (banned) {
            // Ban user
            if (!reason) {
                return res.status(400).json({ message: 'Alasan ban wajib diisi' });
            }

            await db.query(
                'UPDATE users SET banned_at = NOW(), banned_by = ?, ban_reason = ? WHERE id = ?',
                [adminId, reason, id]
            );

            res.json({
                success: true,
                message: `User ${users[0].username} berhasil di-ban`
            });
        } else {
            // Unban user
            await db.query(
                'UPDATE users SET banned_at = NULL, banned_by = NULL, ban_reason = NULL WHERE id = ?',
                [id]
            );

            res.json({
                success: true,
                message: `User ${users[0].username} berhasil di-unban`
            });
        }
    } catch (error) {
        console.error('Ban user error:', error);
        res.status(500).json({ message: 'Gagal memproses ban user' });
    }
};

/**
 * Get user statistics
 * GET /admin/users/stats
 */
exports.getUserStats = async (req, res) => {
    try {
        const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as total_buyers,
        SUM(CASE WHEN role = 'seller' THEN 1 ELSE 0 END) as total_sellers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as total_admins,
        SUM(CASE WHEN banned_at IS NOT NULL THEN 1 ELSE 0 END) as total_banned
      FROM users
    `);

        res.json({
            success: true,
            stats: stats[0]
        });
    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ message: 'Gagal mengambil statistik users' });
    }
};
