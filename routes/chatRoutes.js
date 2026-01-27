import { Router } from "express";
import {
  createMessage,
  getUserChats,
  getChatMessagesById,
  getBookmarkedMessages,
  toggleMessageBookmark,
  deleteChat,
  saveMessage,
  analyzeCrop,
  getUserAnalyses,
} from "../controllers/chatController.js";
import { upload } from "../services/uploadService.js";
import validate from "../middlewares/validate.js";
import { chatBodySchema } from "../validators/chatValidators.js";
import { prepareMessage } from "../middlewares/prepareMessage.js";
import { clerkAuth } from "../middlewares/clerkAuth.js";
import { detectDisease } from "../middlewares/detectDisease.js";
import { requireAuth } from "@clerk/express";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Chat:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the chat
 *         userId:
 *           type: string
 *           description: The user id
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Message'
 *     Message:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         user:
 *           type: string
 *           enum: [user, model]
 *         content:
 *           type: string
 *         image:
 *           type: string
 *           format: binary
 *           description: Optional image file
 *         language:
 *           type: string
 *         latitude:
 *           type: number
 *         longitude:
 *           type: number
 */

/**
 * @swagger
 * /chat:
 *   get:
 *     summary: Get all chats for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of chats
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Chat'
 *       401:
 *         description: Unauthorized
 */
router.get("/", clerkAuth, getUserChats);
/**
 * @swagger
 * /chat/bookmarked:
 *   get:
 *     summary: Get all bookmarked messages
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookmarked messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Unauthorized
 */
router.get("/bookmarked", clerkAuth, getBookmarkedMessages);
/**
 * @swagger
 * /chat/analyze:
 *   get:
 *     summary: Analyze a crop image for diseases
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: imagePath
 *         schema:
 *           type: string
 *         required: true
 *         description: The Cloudinary image URL to analyze
 *     responses:
 *       200:
 *         description: Analysis successful
 *       400:
 *         description: Identification failed or invalid input
 *       500:
 *         description: Server error
 */
router.get("/analyze", clerkAuth, analyzeCrop);
/**
 * @swagger
 * /chat/analyses:
 *   get:
 *     summary: Get all crop analyses for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of analyses
 *       401:
 *         description: Unauthorized
 */
router.get("/analyses", clerkAuth, getUserAnalyses);

/**
 * @swagger
 * /chat/{chatId}:
 *   get:
 *     summary: Get chat by ID
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat ID
 *     responses:
 *       200:
 *         description: The chat with messages
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chat'
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.get("/:chatId", clerkAuth, getChatMessagesById);
/**
 * @swagger
 * /chat/messages:
 *   post:
 *     summary: Create a new message (Start a new conversation)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *         application/json:
 *            schema:
 *              $ref: '#/components/schemas/Message'
 *     responses:
 *       201:
 *         description: The created message/chat
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/messages",
  upload.single("image"),
  clerkAuth,
  // detectDisease,
  validate(chatBodySchema),
  prepareMessage,
  createMessage,
);
/**
 * @swagger
 * /chat/messages/{chatId}:
 *   patch:
 *     summary: Save a message to an existing chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message saved
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/messages/:chatId",
  upload.single("image"),
  clerkAuth,
  // requireAuth({}),
  // detectDisease,
  validate(chatBodySchema),
  prepareMessage,
  saveMessage,
);
/**
 * @swagger
 * /chat/{chatId}/messages/{messageId}/bookmark:
 *   patch:
 *     summary: Toggle bookmark status of a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat ID
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: The message ID
 *     responses:
 *       200:
 *         description: Bookmark status updated
 *       404:
 *         description: Chat or message not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/:chatId/messages/:messageId/bookmark",
  clerkAuth,
  toggleMessageBookmark,
);
/**
 * @swagger
 * /chat/{id}:
 *   delete:
 *     summary: Delete a chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The chat ID
 *     responses:
 *       200:
 *         description: Chat deleted
 *       404:
 *         description: Chat not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", clerkAuth, deleteChat);
export default router;
