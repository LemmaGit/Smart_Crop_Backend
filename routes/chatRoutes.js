const express = require("express");
const { requireAuth } = require("@clerk/express");
const {
  createMessage,
  getUserChats,
  getChatById,
  getBookmarkedMessages,
  updateChat,
  toggleMessageBookmark,
  deleteChat,
} = require("../controllers/chatController");
const { upload } = require("../services/uploadService");

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth());
router.get("/", getUserChats);
router.get("/bookmarked", getBookmarkedMessages);
router.get("/:id", getChatById);
router.post("/messages", upload.single("image"), createMessage);
router.patch("/:id", updateChat);
router.patch("/:chatId/messages/:messageId/bookmark", toggleMessageBookmark);
router.delete("/:id", deleteChat);

module.exports = router;
