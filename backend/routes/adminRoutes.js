const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Akses Ditolak! Khusus Admin.' });
  }
};

router.get('/pending', auth, verifyAdmin, adminController.getPendingChecks);
router.put('/verify/:id', auth, verifyAdmin, adminController.verifyCheck);

module.exports = router;