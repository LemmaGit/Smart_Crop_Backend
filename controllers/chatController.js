import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";
import { formatBookmarkedMessages } from "../services/chatService.js";
import Chat from "../models/chat.js";
import { getAuth } from "@clerk/express";

import { generateResponse, generateChatName } from "../services/gemini.js";

export const createMessage = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const { language, latitude, longitude } = req.validatedData;
  const questionTimestamp = new Date();

  let name = await generateChatName(req.message.content, req.message.imagePath);
  let chat;
  try {
    const botResponseText = await generateResponse({
      history: [],
      message: req.message.content,
      imagePath: req.message?.imagePath,
      language,
      latitude,
      longitude,
    });

    chat = await Chat.create({
      userId,
      name,
      messages: [
        {
          question: { ...req.message, createdAt: questionTimestamp },
          answer: {
            user: "model",
            content: botResponseText,
          },
        },
      ],
    });

    return res.status(StatusCodes.CREATED).json({
      chat,
      chatId: chat._id,
    });
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    try {
      if (chat?._id) {
        await Chat.deleteOne({ _id: chat._id });
      }
    } catch (deleteError) {
      console.error("Failed to delete chat:", deleteError);
    }
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Sorry, I am having trouble processing your request right now.",
    });
  }
});
export const saveMessage = asyncHandler(async (req, res) => {
  const { language, latitude, longitude } = req.validatedData;
  const { chatId } = req.params;
  const questionTimestamp = new Date();
  const chat = await Chat.findById(chatId);
  if (!chat) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: "Chat not found" });
  }

  const history = chat.messages.flatMap((pair) => [
    { user: "user", content: pair.question.content },
    { user: "model", content: pair.answer.content },
  ]);

  let newMessageId;
  try {
    const modelResponseText = await generateResponse({
      history,
      message: req.message.content,
      imagePath: req.message.imagePath,
      language,
      latitude,
      longitude,
    });

    const newPair = {
      question: { ...req.message, createdAt: questionTimestamp },
      answer: {
        user: "model",
        content: modelResponseText,
      },
    };

    chat.messages.push(newPair);
    await chat.save();
    newMessageId = chat.messages[chat.messages.length - 1]._id
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    try {
      chat.messages = chat.messages.filter(
        msg => msg._id !== newMessageId
      );
      await chat.save();
    } catch (deleteError) {
      console.error("Failed to delete message:", deleteError);
    }
  }

  return res.status(StatusCodes.OK).json({ chat });
});
// For showing the user chat history
export const getUserChats = asyncHandler(async (req, res) => {
  console.log("GETTING HISTORY");
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
  console.log("CHAT ID", chatId);
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
  const chats = await Chat.find({
    userId,
    "messages.isBookmarked": true,
  });

  const bookmarkedMessages = formatBookmarkedMessages(chats);

  return res.status(StatusCodes.OK).json({ messages: bookmarkedMessages });
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

  // Find the message pair by its subdocument _id
  const messagePair = chat.messages.id(messageId);

  if (!messagePair) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: "Message pair not found.",
    });
  }

  messagePair.isBookmarked = !messagePair.isBookmarked;
  await chat.save();

  return res.status(StatusCodes.OK).json({ message: messagePair });
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
