const { z } = require('zod');

const birthDateSchema = z.object({
  birthDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'birthDate must be a valid date string',
    }),
});

module.exports = { birthDateSchema };
