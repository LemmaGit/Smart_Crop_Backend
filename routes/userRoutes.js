import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { updateUser } from "../controllers/userController.js";

const router = Router();

router.patch("/me", requireAuth(), updateUser);

export default router;
