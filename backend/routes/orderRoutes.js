const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, orderController.getMyOrders);

module.exports = router;