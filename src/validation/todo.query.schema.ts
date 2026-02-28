import { z } from "zod";

export const todoQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
  completed: z.enum(["true", "false"]).optional(),
  categoryId: z.string().optional(),
  sort: z.enum(["createdAt", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});
