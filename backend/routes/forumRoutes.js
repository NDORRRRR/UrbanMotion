const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middleware/authMiddleware');
const uploadForum = require('../middleware/uploadMiddleware');

// Public: Lihat list thread & detail
router.get('/', forumController.getAllThreads);
router.get('/:id', forumController.getThreadDetail);

// Private: Harus Login buat posting/reply
router.post('/', auth, uploadForum.array('images', 5), forumController.createThread);
router.post('/:id/reply', auth, forumController.createReply);

module.exports = router;