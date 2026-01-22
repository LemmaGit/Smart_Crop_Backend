const { z } = require('zod');

const chatBodySchema = z.object({
  user: z.enum(['user', 'bot']),
  content: z.string().optional(),
  imagePath: z.string().optional(),
});

module.exports = { chatBodySchema };
