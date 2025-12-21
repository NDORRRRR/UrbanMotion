const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const adminUserController = require('../controllers/adminUserController');

// All routes require authentication + admin role
router.use(auth, adminOnly);

// User management
router.get('/users', adminUserController.getAllUsers);
router.get('/users/stats', adminUserController.getUserStats);
router.put('/users/:id/role', adminUserController.changeUserRole);
router.put('/users/:id/ban', adminUserController.banUser);

module.exports = router;
