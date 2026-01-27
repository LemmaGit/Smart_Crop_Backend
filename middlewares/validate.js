import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const validate = (schema) => (req, res, next) => {
  const object = req.body;
  if (!object) {
  }

  const { value, error } = schema.validate(object || {}, {
    stripUnknown: true,
    abortEarly: false,
  });
  if (error) {
    const errors = error.details.map((detail) => detail.message).join(",");
    return next(new ApiError(StatusCodes.BAD_REQUEST, errors));
  }
  req.validatedData = value;
  return next();
};

export default validate;
