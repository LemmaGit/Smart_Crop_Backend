import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { getDiseasePrediction } from "../services/diseaseService.js";

//TODO save the result and the question in the chat messages array

export async function detectDisease(req, res, next) {
  if (req.body.type === "detect") return next();
  try {
    const imageInput = req.file?.path;
    if (!imageInput) {
      return next(new ApiError(StatusCodes.BAD_REQUEST, "Image file is required"));
    }

    const prediction = await getDiseasePrediction(imageInput);

    return res.status(StatusCodes.OK).json({ response: prediction });
  } catch (e) {
    return next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Disease detection service error",
      ),
    );
  }
}
