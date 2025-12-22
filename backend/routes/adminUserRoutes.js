const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const adminUserController = require('../controllers/adminUserController');

router.use(auth, adminOnly);

router.get('/', adminUserController.getAllUsers);
router.get('/stats', adminUserController.getUserStats);
router.put('/:id/role', adminUserController.changeUserRole);
router.put('/:id/ban', adminUserController.banUser);

module.exports = router;