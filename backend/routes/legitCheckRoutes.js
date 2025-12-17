const express = require('express');
const router = express.Router();
const legitCheckController = require('../controllers/legitCheckController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/submit', auth, upload.array('images', 10), legitCheckController.submitLegitCheck);
router.get('/history', auth, legitCheckController.getMyHistory);
router.get('/:id', auth, legitCheckController.getLegitCheckById);

module.exports = router;