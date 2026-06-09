import { z } from "zod";

const locationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  address: z.string().trim().min(3, "Location address must have at least 3 characters"),
});

export const createGroupSchema = z.object({
  name: z.string().trim().min(3, "Group name must have at least 3 characters"),
  joinPassword: z.string().trim().min(4, "Group password must have at least 4 characters"),
  location: locationSchema,
  cabinDetails: z.string().trim().min(3, "Cabin details must have at least 3 characters"),
});

export const updateGroupSchema = z
  .object({
    name: z.string().trim().min(3).optional(),
    joinPassword: z.string().trim().min(4).optional(),
    location: locationSchema.partial().optional(),
    cabinDetails: z.string().trim().min(3).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required",
  });

export const joinGroupSchema = z.object({
  shareCode: z.string().trim().length(6),
  joinPassword: z.string().trim().min(1),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type JoinGroupInput = z.infer<typeof joinGroupSchema>;
