const { StatusCodes } = require('http-status-codes');
const { clerkClient } = require('@clerk/express');
const asyncHandler = require('express-async-handler');
const { userUpdateSchema } = require('../validators/userValidators');
const { getAuth } = require('@clerk/express');

const updateUser = asyncHandler(async (req, res) => {
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

module.exports = { updateUser };
