import { z } from "zod";

export const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
});
