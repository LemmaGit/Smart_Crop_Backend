const { StatusCodes } = require('http-status-codes');
const { clerkClient } = require('@clerk/express');
const { birthDateSchema } = require('../validators/userValidators');

const updateBirthDate = async (req, res, next) => {
  try {
    const { userId } = req.auth;
    const parsed = birthDateSchema.parse(req.body);

    const updatedUser = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { birthDate: parsed.birthDate },
    });

    return res.status(StatusCodes.OK).json({
      userId,
      publicMetadata: updatedUser.publicMetadata,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { updateBirthDate };
