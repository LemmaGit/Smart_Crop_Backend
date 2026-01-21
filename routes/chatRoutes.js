const express = require('express');
const { ClerkExpressRequireAuth } = require('@clerk/express');
const { createMessage, getChatHistory } = require('../controllers/chatController');
const { upload } = require('../services/uploadService');

const router = express.Router();

router.post('/messages', ClerkExpressRequireAuth(), upload.single('image'), createMessage);
router.get('/', ClerkExpressRequireAuth(), getChatHistory);

module.exports = router;
