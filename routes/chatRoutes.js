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
import validate from "../middlewares/validate.js";
import {
  baseChatBodySchema,
  messageWithIdSchema,
} from "../validators/chatValidators.js";
import { prepareMessage } from "../middlewares/prepareMessage.js";
import { clerkAuth } from "../middlewares/clerkAuth.js";

const router = Router();
// TODO: CURRENTLY OUR ROUTES ARE NOT PROTECTED 
router.get("/", getUserChats);
router.get("/bookmarked", requireAuth(), getBookmarkedMessages);
router.get("/:id", requireAuth(), getChatMessagesById);
router.post(
  "/messages",
  upload.single("image"),
  clerkAuth,
  (req, res, next) => {
    console.log(req.file.path, "Uploaded")
    console.log(req.body, "Body")
    console.log(req.userId, "User")
    next()
  },
  validate(baseChatBodySchema),
  prepareMessage,
  createMessage,
);
router.patch(
  "/messages",
  upload.single("image"),
  requireAuth(),
  validate(messageWithIdSchema),
  prepareMessage,
  saveMessage,
);
router.patch("/:id", requireAuth(), updateChat);
router.patch(
  "/:chatId/messages/:messageId/bookmark",
  requireAuth(),
  toggleMessageBookmark,
);
router.delete("/:id", requireAuth(), deleteChat);

export default router;
