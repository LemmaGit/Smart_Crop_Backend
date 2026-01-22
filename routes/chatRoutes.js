const express = require('express');
const { requireAuth } = require('@clerk/express');
const {
    createMessage,
    getUserChats,
    getChatMessagesById,
    getBookmarkedMessages,
    updateChat,
    toggleMessageBookmark,
    deleteChat,
    saveMessage,
} = require('../controllers/chatController');
const { upload } = require('../services/uploadService');

const router = express.Router();


router.use(requireAuth());

router.get('/', getUserChats);
router.get('/bookmarked', getBookmarkedMessages);
router.get('/:id', getChatMessagesById);
router.post('/messages', upload.single('image'), createMessage);
router.patch('/messages', upload.single('image'), saveMessage);
router.patch('/:id', updateChat);
router.patch('/:chatId/messages/:messageId/bookmark', toggleMessageBookmark);
router.delete('/:id', deleteChat);

module.exports = router;
