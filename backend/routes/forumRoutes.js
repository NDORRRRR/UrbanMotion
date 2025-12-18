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
router.delete('/:id', auth, forumController.deleteThread); // Route Hapus

module.exports = router;