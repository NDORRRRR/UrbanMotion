const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const adminAnalyticsController = require('../controllers/adminAnalyticsController');

// All routes require authentication + admin role
router.use(auth, adminOnly);

// Analytics endpoints
router.get('/dashboard', adminAnalyticsController.getDashboardStats);
router.get('/revenue', adminAnalyticsController.getRevenueData);
router.get('/users', adminAnalyticsController.getUserGrowthData);

module.exports = router;
