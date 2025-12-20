const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const uploadProduct = require('../middleware/uploadMiddleware');

// Stats & Products
router.get('/stats', auth, dashboardController.getSellerStats);
router.get('/products', auth, dashboardController.getSellerProducts);
router.get('/orders', auth, dashboardController.getSellerOrders);

// Product Management
router.put('/products/:id', auth, dashboardController.updateProduct);
router.delete('/products/:id', auth, dashboardController.deleteProduct);

// Image Management
router.get('/products/:id/images', auth, dashboardController.getProductImages);
router.post('/products/:id/images', auth, uploadProduct.single('image'), dashboardController.addProductImage);
router.delete('/products/:productId/images/:imageId', auth, dashboardController.deleteProductImage);

// Order Management
router.put('/orders/:id/status', auth, dashboardController.updateOrderStatus);

module.exports = router;