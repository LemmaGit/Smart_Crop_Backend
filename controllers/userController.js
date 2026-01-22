import { StatusCodes } from "http-status-codes";
import { clerkClient } from "@clerk/express";
import asyncHandler from "express-async-handler";
import { userUpdateSchema } from "../validators/userValidators.js";
import { getAuth } from "@clerk/express";

export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = getAuth(req);
  const parsed = userUpdateSchema.parse(req.body);

  const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: parsed,
  });

  return res.status(StatusCodes.OK).json({
    userId,
    publicMetadata: updatedUser.publicMetadata,
  });
});
