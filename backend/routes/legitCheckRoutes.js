const express = require('express');
const router = express.Router();

const legitCheckController = require('../controllers/legitCheckController');
const auth = require('../middleware/authMiddleware');
const { uploadLegit } = require('../middleware/uploadMiddleware');

router.post('/submit', auth, uploadLegit.array('images', 10), legitCheckController.submitLegitCheck);
router.get('/history', auth, legitCheckController.getMyHistory);

module.exports = router;