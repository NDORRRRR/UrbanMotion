const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

// Middleware: Cek apakah user adalah seller/admin
const verifySeller = (req, res, next) => {
  if (req.user && (req.user.role === 'reseller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Akses Ditolak! Harus Seller/Admin.' });
  }
};

router.use(auth, verifySeller);

// Stats
router.get('/stats', dashboardController.getSellerStats);

// Products Management
router.get('/products', dashboardController.getSellerProducts);
router.put('/products/:id', dashboardController.updateProduct);
router.delete('/products/:id', dashboardController.deleteProduct);

// Orders Management
router.get('/orders', dashboardController.getSellerOrders);
router.put('/orders/:id/status', dashboardController.updateOrderStatus);

module.exports = router;