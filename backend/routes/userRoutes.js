const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, upload.single('profile_picture'), userController.updateProfile);

module.exports = router;