import { z } from "zod";

const createNoteSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required").max(100, "Title is too long"),
        content: z.string().optional(),
    }),
});

const updateNoteSchema = z.object({
    body: z
        .object({
            title: z.string().min(1, "Title cannot be empty").max(100).optional(),
            content: z.string().optional(),
        })
        .refine((data) => data.title || data.content, {
            message: "Provide at least title or content",
            path: ["title"],
        }),
});

export { createNoteSchema, updateNoteSchema };
