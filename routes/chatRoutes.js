import { Router } from "express";
import { requireAuth } from "@clerk/express";
import {
  createMessage,
  getUserChats,
  getChatMessagesById,
  getBookmarkedMessages,
  updateChat,
  toggleMessageBookmark,
  deleteChat,
  saveMessage,
} from "../controllers/chatController.js";
import { upload } from "../services/uploadService.js";

const router = Router();

router.use(requireAuth());

router.get("/", requireAuth(), getUserChats);
router.get("/bookmarked", requireAuth(), getBookmarkedMessages);
router.get("/:id", requireAuth(), getChatMessagesById);
router.post("/messages", upload.single("image"), requireAuth(), createMessage);
router.patch("/messages", upload.single("image"), requireAuth(), saveMessage);
router.patch("/:id", requireAuth(), updateChat);
router.patch(
  "/:chatId/messages/:messageId/bookmark",
  requireAuth(),
  toggleMessageBookmark,
);
router.delete("/:id", requireAuth(), deleteChat);

export default router;
