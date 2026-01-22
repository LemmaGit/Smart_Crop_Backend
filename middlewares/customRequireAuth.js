import { verifyToken } from "@clerk/express";
import asyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";

export const customRequireAuthToken = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  const payload = await verifyToken(token);

  req.auth = {
    userId: payload.sub,
    sessionId: payload.sid,
    claims: payload,
  };

  next();
});
