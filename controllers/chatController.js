const { StatusCodes } = require('http-status-codes');
const asyncHandler = require('express-async-handler');
const { prepareMessage, formatBookmarkedMessages } = require('../services/chatService');
const Chat = require('../models/chat');

// TODO change the file upload logic
const createMessage = asyncHandler(async (req, res) => {
  const { userId } = req.auth;

  const messageData = prepareMessage(req.body, req.file);

  const message = {
    user: messageData.user,
    content: messageData.content,
    contentType: messageData.contentType,
  };

  // let chat;

  const chat = await Chat.create({
    userId,
    messages: [message],
  });

  return res.status(StatusCodes.CREATED).json({ chat });
});

// For showing the user chat history
const getUserChats = asyncHandler(async (req, res) => {
  const { userId } = req.auth;
  // Return summary of chats (id, name, createdAt, updatedAt)
  const chats = await Chat.find({ userId })
    .select('name createdAt updatedAt')
    .sort({ updatedAt: -1 });

  return res.status(StatusCodes.OK).json({ chats });
});

// For getting messages of the Chat
const getChatMessagesById = asyncHandler(async (req, res) => {
  const { userId } = req.auth;
  const { chatId } = req.params;

  const chat = await Chat.findOne({ _id: chatId, userId }).select('messages')
    .sort({ createdAt: 1 });

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Chat not found.',
    });
  }

  return res.status(StatusCodes.OK).json({ chat });
});

const getBookmarkedMessages = asyncHandler(async (req, res) => {
  const { userId } = req.auth;
  // Find chats that contain at least one bookmarked message
  const chats = await Chat.find({ userId, 'messages.isBookmarked': true })

  const bookmarkedMessages = formatBookmarkedMessages(chats);

  return res.status(StatusCodes.OK).json({ messages: bookmarkedMessages });
});

const updateChat = asyncHandler(async (req, res) => {
  const { userId } = req.auth;
  const { id } = req.params;
  const { name } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name;

  const chat = await Chat.findOneAndUpdate(
    { _id: id, userId },
    updates,
    { new: true, runValidators: true }
  );

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Chat not found.',
    });
  }

  return res.status(StatusCodes.OK).json({ chat });
});

const toggleMessageBookmark = asyncHandler(async (req, res) => {
  const { userId } = req.auth;
  const { chatId, messageId } = req.params;

  const chat = await Chat.findOne({ _id: chatId, userId });

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Chat not found.',
    });
  }

  const message = chat.messages.id(messageId);
  if (!message) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Message not found.',
    });
  }

  message.isBookmarked = !message.isBookmarked;
  await chat.save();

  return res.status(StatusCodes.OK).json({ message });
});

const deleteChat = asyncHandler(async (req, res) => {
  const { userId } = req.auth;
  const { id } = req.params;

  const chat = await Chat.findOneAndDelete({ _id: id, userId });

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Chat not found.',
    });
  }

  return res.status(StatusCodes.OK).json({ message: 'Chat deleted successfully.' });
});

module.exports = {
  createMessage,
  getUserChats,
  getChatMessagesById,
  getBookmarkedMessages,
  updateChat,
  toggleMessageBookmark,
  deleteChat,
};
