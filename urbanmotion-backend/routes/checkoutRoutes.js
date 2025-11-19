const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, checkoutController.createTransaction);

module.exports = router;