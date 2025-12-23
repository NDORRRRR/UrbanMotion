const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const auth = require('../middleware/authMiddleware');
const uploadForum = require('../middleware/uploadMiddleware');

router.get('/', forumController.getAllThreads);
router.get('/:id', forumController.getThreadById);

router.post('/', auth, forumController.createThread);
router.post('/:id/reply', auth, forumController.createReply);
router.delete('/:id', auth, forumController.deleteThread);

module.exports = router;