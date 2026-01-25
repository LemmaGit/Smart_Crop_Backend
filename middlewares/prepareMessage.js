import { StatusCodes } from "http-status-codes";
import ApiError from "../utils/ApiError.js";

export const prepareMessage = (req, res, next) => {
  const hasImage = Boolean(req.file);
  if (hasImage && !req.file.path) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Image upload failed, try again later.",
      ),
    );
  }
  if (!hasImage && !req.validatedData.content) {
    return next(
      new ApiError(
        StatusCodes.BAD_REQUEST,
        "Either text content or an image file is required.",
      ),
    );
  }
  const message = {
    content: req.validatedData.content,
    user: req.validatedData.user,
    ...(hasImage && { imagePath: req.file.path }),
  };

  req.message = message;
  next();
};
