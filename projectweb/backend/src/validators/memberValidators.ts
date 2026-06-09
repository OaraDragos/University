import { z } from "zod";

export const memberSchema = z.object({
  authUserId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(2, "Member name must have at least 2 characters"),
  gender: z.enum(["male", "female", "other"]),
  ageRange: z.enum(["18-24", "24-30", "30-40", "40-50", "50+"]),
  drinkLevel: z.number().int().min(1).max(5),
  foodAppetite: z.number().int().min(1).max(5),
});

export const memberUpdateSchema = memberSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: "At least one field is required",
});

export type CreateMemberInput = z.infer<typeof memberSchema>;
export type UpdateMemberInput = z.infer<typeof memberUpdateSchema>;
