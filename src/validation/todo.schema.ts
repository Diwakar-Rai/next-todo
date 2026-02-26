import { z } from "zod";

export const createTodoSchema = z.object({
  title: z
    .string({ error: "Title is required." })
    .trim()
    .min(1, "Title is required."),
  description: z.string().optional(),
  categoryId: z.string().optional(),
});

export const updateTodoSchema = z.object({
  title: z.string().trim().min(1, "Title cannot be empty").optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
  categoryId: z.string().optional(),
});
