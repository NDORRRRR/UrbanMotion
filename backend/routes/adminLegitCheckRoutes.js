const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const adminLegitCheckController = require('../controllers/adminLegitCheckController');

router.use(auth);
router.use(adminOnly);

router.get('/', adminLegitCheckController.getPendingLegitChecks);
router.get('/pending', adminLegitCheckController.getPendingLegitChecks);
router.get('/stats', adminLegitCheckController.getLegitCheckStats);
router.put('/:id/review', adminLegitCheckController.reviewLegitCheck);

module.exports = router;
