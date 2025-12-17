const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const { uploadProduct } = require('../middleware/uploadMiddleware');
const { validateProduct } = require('../middleware/validateInput');

const verifySeller = (req, res, next) => {
  if (req.user && (req.user.role === 'reseller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Akses Ditolak! Anda harus jadi Reseller.' });
  }
};

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', auth, verifySeller, uploadProduct.array('images', 6), validateProduct, productController.createProduct);

module.exports = router;