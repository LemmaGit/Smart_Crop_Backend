import Joi from "joi";

export const baseChatBodySchema = Joi.object({
  user: Joi.string().valid("user", "bot").required(),
  content: Joi.string().optional(),
  imagePath: Joi.string().optional(),
  language: Joi.string().optional(),
  latitude: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
  longitude: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
});

export const messageWithIdSchema = baseChatBodySchema.keys({
  chatId: Joi.string().required(),
});
