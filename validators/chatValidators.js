import { z } from "zod";

export const chatBodySchema = z.object({
  user: z.enum(["user", "bot"]),
  content: z.string().optional(),
  imagePath: z.string().optional(),
});
