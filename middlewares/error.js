import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { getReasonPhrase, StatusCodes } from "http-status-codes";

export const errorConverter = (err, _req, _res, next) => {
  const error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? StatusCodes.BAD_REQUEST
        : StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || getReasonPhrase(statusCode);

    error = new ApiError(statusCode, message, false, error.stack);
  }

  next(error);
};

export const errorHandler = (err, _req, _res, next) => {
  let { statusCode, message } = err;

  if (process.env.NODE_ENV === "production" && err.isOperational) {
    statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    message = getReasonPhrase(statusCode);
  }
  const response = {
    error: true,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };
  _res.locals.errorMessage = message;
  if (process.env.NODE_ENV === "development") console.log(err);
  _res.status(statusCode).json(response);
};
