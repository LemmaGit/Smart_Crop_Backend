import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import {
  prepareMessage,
  formatBookmarkedMessages,
} from "../services/chatService.js";
import Chat from "../models/chat.js";
import { getAuth } from "@clerk/express";

// For finding user use -> clerkClient.users.getUser(userId)

export const createMessage = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);

  const message = prepareMessage(req.body, req.file);

  const chat = await Chat.create({
    userId,
    messages: [message],
  });

  return res.status(StatusCodes.CREATED).json({
    chat,
    chatId: chat._id,
  });
});

export const saveMessage = asyncHandler(async (req, res) => {
  const message = prepareMessage(req.body, req.file);

  const { chatId } = req.body;

  const chat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { messages: message },
    },
    { new: true, runValidators: true },
  );

  return res.status(StatusCodes.OK).json({ chat });
});

// For showing the user chat history
export const getUserChats = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const chats = await Chat.find({ userId })
    .select("name createdAt updatedAt")
    .sort({ updatedAt: -1 });

  return res.status(StatusCodes.OK).json({ chats });
});

// For getting messages of the Chat
export const getChatMessagesById = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { chatId } = req.params;

  const chat = await Chat.findOne({ _id: chatId, userId })
    .select("messages")
    .sort({ createdAt: 1 });

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Chat not found.",
    });
  }

  return res.status(StatusCodes.OK).json({ chat });
});

export const getBookmarkedMessages = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const chats = await Chat.find({ userId, "messages.isBookmarked": true });

  const bookmarkedMessages = formatBookmarkedMessages(chats);

  return res.status(StatusCodes.OK).json({ messages: bookmarkedMessages });
});

export const updateChat = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { id } = req.params;
  const { name } = req.body;

  const updates = { name };

  const chat = await Chat.findOneAndUpdate({ _id: id, userId }, updates, {
    new: true,
    runValidators: true,
  });

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Chat not found.",
    });
  }

  return res.status(StatusCodes.OK).json({ chat });
});

export const toggleMessageBookmark = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { chatId, messageId } = req.params;

  const chat = await Chat.findOne({ _id: chatId, userId });

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Chat not found.",
    });
  }

  const message = chat.messages.id(messageId);
  if (!message) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Message not found.",
    });
  }

  message.isBookmarked = !message.isBookmarked;
  await chat.save();

  return res.status(StatusCodes.OK).json({ message });
});

export const deleteChat = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { id } = req.params;

  const chat = await Chat.findOneAndDelete({ _id: id, userId });

  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Chat not found.",
    });
  }

  return res
    .status(StatusCodes.OK)
    .json({ message: "Chat deleted successfully." });
});
