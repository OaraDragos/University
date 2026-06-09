import { z } from "zod";

export const votesSchema = z.object({
  thumbsUp: z.array(z.string()),
  thumbsDown: z.array(z.string()),
});

export const createProductSchema = z.object({
  productName: z.string().trim().min(2, "Product name must have at least 2 characters"),
  supermarket: z.string().trim().min(2, "Supermarket must have at least 2 characters"),
  price: z.number().nonnegative("Price must be non-negative"),
  quantity: z.number().int().min(1).optional(),
  unit: z.string().trim().min(1).optional(),
  category: z.string().trim().min(2, "Category must have at least 2 characters"),
  photo: z.string().trim().url().optional(),
  claimedBy: z.string().optional(),
  addedBy: z.string().min(1),
  addedByName: z.string().trim().min(2),
  votes: votesSchema.optional(),
});

export const updateProductSchema = z
  .object({
    productName: z.string().trim().min(2).optional(),
    supermarket: z.string().trim().min(2).optional(),
    price: z.number().nonnegative().optional(),
    quantity: z.number().int().min(1).optional(),
    unit: z.string().trim().min(1).optional(),
    category: z.string().trim().min(2).optional(),
    photo: z.string().trim().url().optional().nullable(),
    claimedBy: z.string().optional().nullable(),
    votes: votesSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
