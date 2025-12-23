const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', auth, cartController.getCart);

router.post('/', auth, cartController.addOrUpdateCartItem);

router.delete('/:productId', auth, cartController.removeCartItem);

module.exports = router;