const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, orderController.getMyOrders);
router.post('/item/:id/confirm', auth, orderController.confirmOrderItem);
router.post('/:id/cancel', auth, orderController.cancelOrder);

module.exports = router;