const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const db = require('../config/db');

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses Ditolak! Khusus Admin.' });
  }
};

router.get('/pending', auth, verifyAdmin, adminController.getPendingChecks);
router.put('/verify/:id', auth, verifyAdmin, adminController.verifyCheck);
router.get('/dashboard', auth, verifyAdmin, async (req, res) => {
  try {
    // Total users
    const [users] = await db.query('SELECT COUNT(*) as total FROM users');
    
    // Total orders
    const [orders] = await db.query('SELECT COUNT(*) as total FROM orders');
    
    // Total revenue (only paid orders)
    const [revenue] = await db.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total 
       FROM orders WHERE payment_status = 'paid'`
    );
    
    // Pending legit checks
    const [pending] = await db.query(
      `SELECT COUNT(*) as total 
       FROM legit_checks WHERE status = 'pending'`
    );
    
    res.json({
      total_users: users[0].total,
      total_orders: orders[0].total,
      total_revenue: revenue[0].total,
      pending_legit_checks: pending[0].total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


module.exports = router;