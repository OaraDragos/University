import { randomInt } from "node:crypto";

type ChallengePurpose = "LOGIN_CODE" | "PASSWORD_RESET";

type Challenge = {
  purpose: ChallengePurpose;
  identifier: string;
  code: string;
  expiresAtMs: number;
};

const ttlMs = Number(process.env.AUTH_CODE_TTL_MS ?? 10 * 60 * 1000);
const challenges = new Map<string, Challenge>();

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function challengeKey(purpose: ChallengePurpose, identifier: string): string {
  return `${purpose}:${normalizeIdentifier(identifier)}`;
}

function createCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function issueChallenge(purpose: ChallengePurpose, identifier: string): { code: string; expiresAt: string } {
  const now = Date.now();
  const code = createCode();
  const expiresAtMs = now + ttlMs;
  const key = challengeKey(purpose, identifier);

  challenges.set(key, {
    purpose,
    identifier: normalizeIdentifier(identifier),
    code,
    expiresAtMs,
  });

  return {
    code,
    expiresAt: new Date(expiresAtMs).toISOString(),
  };
}

export function verifyChallenge(purpose: ChallengePurpose, identifier: string, code: string): boolean {
  const key = challengeKey(purpose, identifier);
  const challenge = challenges.get(key);
  if (!challenge) return false;

  if (challenge.expiresAtMs <= Date.now()) {
    challenges.delete(key);
    return false;
  }

  const ok = challenge.code === code.trim();
  if (ok) {
    challenges.delete(key);
  }

  return ok;
}
