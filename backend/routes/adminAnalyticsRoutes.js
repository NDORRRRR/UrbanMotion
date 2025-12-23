const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

router.use(auth);
router.use(adminOnly);

router.get('/dashboard', adminAnalyticsController.getDashboardStats);
router.get('/revenue', adminAnalyticsController.getRevenueData);
router.get('/users', adminAnalyticsController.getUserGrowthData);

module.exports = router;
