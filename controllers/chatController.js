const { StatusCodes } = require('http-status-codes');
const { chatBodySchema } = require('../validators/chatValidators');
const { uploadBufferToCloudinary } = require('../services/uploadService');
const Chat = require('../models/chat');

const createMessage = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const hasImage = Boolean(req.file);
    const parsed = chatBodySchema.parse({
      user: req.body.user,
      content: req.body.content,
    });

    if (!hasImage && !parsed.content) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Either text content or an image file is required.',
      });
    }

    let messageContent = parsed.content;
    let contentType = 'text';

    if (hasImage) {
      messageContent = await uploadBufferToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      contentType = 'image';
    }

    const message = {
      user: parsed.user,
      content: messageContent,
      contentType,
    };

    const chat = await Chat.findOneAndUpdate(
      { userId },
      { $push: { messages: message } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(StatusCodes.CREATED).json({ chat });
  } catch (error) {
    next(error);
  }
};

const getChatHistory = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const chat = await Chat.findOne({ userId });

    if (!chat) {
      return res.status(StatusCodes.NOT_FOUND).json({
        message: 'No chat history found for this user.',
      });
    }

    return res.status(StatusCodes.OK).json({ chat });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMessage, getChatHistory };
