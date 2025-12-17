const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware'); // Pastikan ini import-nya bener

router.get('/stats', auth, dashboardController.getSellerStats);
router.get('/products', auth, dashboardController.getSellerProducts); // Ini yang bikin 404 kalau hilang
router.get('/orders', auth, dashboardController.getSellerOrders);

module.exports = router;