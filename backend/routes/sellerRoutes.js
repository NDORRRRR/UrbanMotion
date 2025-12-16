const express = require('express');
const router = express.Router();
const sellerController = require('../controllers/sellerController');
const auth = require('../middleware/authMiddleware');

const verifySeller = (req, res, next) => {
  if (req.user && (req.user.role === 'reseller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Akses ditolak! Khusus Seller.' });
  }
};

router.get('/orders', auth, verifySeller, sellerController.getMyOrders);
router.put('/shipping/:orderItemId', auth, verifySeller, sellerController.updateShipping);

module.exports = router;