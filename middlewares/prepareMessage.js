import ApiError from "../utils/ApiError.js";

export const prepareMessage = (req, res, next) => {
  const hasImage = Boolean(req.file?.path);

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
  console.log(req.message, "Message")
  console.log(req.validatedData, "Validated Data")
  next();
};
