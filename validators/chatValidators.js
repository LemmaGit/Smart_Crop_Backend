import Joi from "joi";

export const baseChatBodySchema = Joi.object({
  user: Joi.string().valid("user", "bot").required(),
  content: Joi.string().optional(),
  imagePath: Joi.string().optional(),
});

export const messageWithIdSchema = baseChatBodySchema.keys({
  chatId: Joi.string().required(),
});
