const { StatusCodes } = require('http-status-codes');
const { clerkClient } = require('@clerk/express');
const asyncHandler = require('express-async-handler');
const { birthDateSchema } = require('../validators/userValidators');

const updateBirthDate = asyncHandler(async (req, res) => {
  const { userId } = req.auth;
  const parsed = birthDateSchema.parse(req.body);

  const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
    publicMetadata: { birthDate: parsed.birthDate },
  });

  return res.status(StatusCodes.OK).json({
    userId,
    publicMetadata: updatedUser.publicMetadata,
  });
});

module.exports = { updateBirthDate };
