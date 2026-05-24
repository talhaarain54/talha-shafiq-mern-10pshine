import { z } from "zod";

const tagSchema = z
  .string()
  .min(1)
  .max(30)
  .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tags can only contain letters, numbers, spaces, hyphens and underscores");

const createNoteSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
    content: z.string().optional(),
    tags: z.array(tagSchema).max(10, "Max 10 tags allowed").optional().default([]),
  }),
});

const updateNoteSchema = z.object({
  body: z
    .object({
      title: z.string().min(1).max(100).optional(),
      content: z.string().optional(),
      tags: z.array(tagSchema).max(10).optional(),
    })
    .refine(
      (data) => data.title !== undefined || data.content !== undefined || data.tags !== undefined,
      { message: "Provide at least title, content, or tags", path: ["title"] }
    ),
});

export { createNoteSchema, updateNoteSchema };