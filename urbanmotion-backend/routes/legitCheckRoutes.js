const express = require('express');
const router = express.Router();

const legitCheckController = require('../controllers/legitCheckController');
const auth = require('../middleware/authMiddleware'); // Login
const upload = require('../middleware/uploadMiddleware'); // Upload

router.post('/submit', auth, upload.array('images', 10), legitCheckController.submitLegitCheck);
router.get('/history', auth, legitCheckController.getMyHistory);

module.exports = router;