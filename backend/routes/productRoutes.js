const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Kita pakai upload yg sama

const verifySeller = (req, res, next) => {
  if (req.user && (req.user.role === 'reseller' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Akses Ditolak! Anda harus jadi Reseller.' });
  }
};

router.get('/', productController.getAllProducts);

router.post('/', auth, verifySeller, upload.array('images', 6), productController.createProduct);

module.exports = router;