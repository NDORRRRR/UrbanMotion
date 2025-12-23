const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const adminProductController = require('../controllers/adminProductController');

router.use(auth);
router.use(adminOnly);

router.get('/', adminProductController.getPendingProducts);
router.get('/pending', adminProductController.getPendingProducts);
router.put('/:id/approve', adminProductController.approveProduct);
router.put('/:id/reject', adminProductController.rejectProduct);

module.exports = router;
