import joi from "joi";
import ApiError from "../utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

const validate = (schema) => (req, res, next) => {
  const object = req.body;
  if (!object) {
    // If no body, empty object for validation (maybe schema allows optional fields?)
    // But usually body parser provides {} if empty.
  }

  // Use schema.validate directly. 
  // Joi validation options: abortEarly: false, stripUnknown: true
  const { value, error } = schema.validate(object || {}, { stripUnknown: true, abortEarly: false });
  console.log(value, "Value")
  console.log(error, "Error")
  console.log(object, "Object")
  if (error) {
    const errors = error.details.map((detail) => detail.message).join(",");

    next(new ApiError(StatusCodes.BAD_REQUEST, errors));
    return res.status(StatusCodes.BAD_REQUEST).json({ error: true, errors });
  }
  req.validatedData = value;
  return next();
};

export default validate;
