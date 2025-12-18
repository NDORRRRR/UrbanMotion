const express = require('express');
const router = express.Router();
const midtransController = require('../controllers/midtransController');

// Route untuk menerima Webhook dari Midtrans
// Endpoint: /api/payment/notification
router.post('/notification', midtransController.handleNotification);

module.exports = router;
