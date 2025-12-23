const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const uploadProduct = require('../middleware/uploadMiddleware');

router.get('/stats', dashboardController.getSellerStats);
router.get('/products', dashboardController.getSellerProducts);
router.get('/orders', dashboardController.getSellerOrders);

router.put('/products/:id', dashboardController.updateProduct);
router.delete('/products/:id', dashboardController.deleteProduct);

router.get('/products/:id/images', dashboardController.getProductImages);
router.post('/products/:id/images', auth, uploadProduct.single('image'), dashboardController.addProductImage);
router.delete('/products/:productId/images/:imageId', dashboardController.deleteProductImage);

router.put('/orders/:orderId/status', dashboardController.updateOrderStatus);

module.exports = router;