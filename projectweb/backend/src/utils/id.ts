import { randomUUID } from "node:crypto";

export function createId(): string {
  return randomUUID();
}

export function createShareCode(existingCodes: Set<string>): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  do {
    code = "";
    for (let i = 0; i < 6; i += 1) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  } while (existingCodes.has(code));

  return code;
}
