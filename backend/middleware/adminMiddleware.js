const db = require('../config/db');

/**
 * Admin Middleware
 * Verifies that the authenticated user has admin role
 */
const adminOnly = async (req, res, next) => {
    try {
        // User already authenticated by auth middleware

        if (users.length === 0) {
            return res.status(404).json({ message: 'User tidak ditemukan' });
        }

        const user = users[0];

        // Check if user is banned
        if (user.banned_at) {
            return res.status(403).json({
                message: 'Akun Anda telah dibanned dan tidak dapat mengakses sistem'
            });
        }

        // Check admin role
        if (user.role !== 'admin') {
            return res.status(403).json({
                message: 'Akses ditolak. Hanya admin yang dapat mengakses resource ini.'
            });
        }

        // User is admin, proceed
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

module.exports = adminOnly;
