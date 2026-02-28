import { z } from "zod";
export const createCategorySchema = z.object({
  name: z
    .string({ error: "Category name is required" })
    .trim()
    .min(1, "Category name is required"),
});
export const updateCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
});
