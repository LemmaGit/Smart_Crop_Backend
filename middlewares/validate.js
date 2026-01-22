import joi from "joi";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const validate = (schema) => (req, res, next) => {
  const keys = Object.keys(schema);
  const object = keys.reduce((obj, key) => {
    if (Object.prototype.hasOwnProperty.call(req, key)) {
      obj[key] = req[key];
    }
    return obj;
  }, {});
  const { value, error } = joi.compile(schema).validate(object);
  if (error) {
    const errors = error.details.map((detail) => detail.message).join(",");

    next(new ApiError(StatusCodes.BAD_REQUEST, errors));
    return res.status(StatusCodes.BAD_REQUEST).json({ error: true, errors });
  }
  req.validatedData = value;
  return next();
};

export default validate;
