import Joi from "joi";

export const chatBodySchema = Joi.object({
  user: Joi.string().valid("user", "model").required(),
  content: Joi.string().optional(),
  imagePath: Joi.string().optional(),
  language: Joi.string().optional(),
  latitude: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  longitude: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
});
