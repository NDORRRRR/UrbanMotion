const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const adminLegitCheckController = require('../controllers/adminLegitCheckController');

// All routes require authentication + admin role
router.use(auth, adminOnly);

// Legit check management
router.get('/', adminLegitCheckController.getAllLegitChecks);
router.get('/pending', adminLegitCheckController.getPendingLegitChecks);
router.get('/stats', adminLegitCheckController.getLegitCheckStats);
router.put('/:id/review', adminLegitCheckController.reviewLegitCheck);

module.exports = router;
