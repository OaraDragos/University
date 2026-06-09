import { ZodSchema } from "zod";
import { HttpError } from "./errors";

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join(", ");
    throw new HttpError(400, message || "Invalid request body");
  }
  return parsed.data;
}
