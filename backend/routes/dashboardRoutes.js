const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

router.get('/stats', auth, dashboardController.getSellerStats);
router.get('/products', auth, dashboardController.getSellerProducts);
router.get('/orders', auth, dashboardController.getSellerOrders);

router.put('/products/:id', auth, dashboardController.updateProduct);
router.delete('/products/:id', auth, dashboardController.deleteProduct);
router.put('/orders/:id/status', auth, dashboardController.updateOrderStatus);

module.exports = router;