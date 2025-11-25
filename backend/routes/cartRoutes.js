const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/authMiddleware'); // Wajib Login

router.use(auth);

// GET /api/cart (Ambil isi keranjang)
router.get('/', cartController.getCart);

// POST /api/cart (Tambah/Update item)
router.post('/', cartController.updateCart);

// DELETE /api/cart/:productId (Hapus item)
router.delete('/:productId', cartController.removeItem);

module.exports = router;