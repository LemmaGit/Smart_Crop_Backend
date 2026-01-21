const { z } = require('zod');

const userUpdateSchema = z.object({
  birthDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: 'birthDate must be a valid date string',
    })
    .optional(),
  phoneNumber: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .optional(),
});

module.exports = { userUpdateSchema };
