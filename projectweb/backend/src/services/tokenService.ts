import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthUser } from "./authService";

const tokenSecret = process.env.AUTH_TOKEN_SECRET ?? "silver-dev-secret-change-me";
const tokenTtlMs = Number(process.env.AUTH_TOKEN_TTL_MS ?? 30 * 60 * 1000);
export const inactivityTimeoutMs = Number(process.env.AUTH_INACTIVITY_TIMEOUT_MS ?? 15 * 60 * 1000);
const sessions = new Map<string, { userId: string; expiresAtMs: number; lastActivityMs: number }>();

export type AuthSession = {
  user: AuthUser;
  token: string;
  permissionScheme: string;
  expiresAt: string;
  inactivityTimeoutMs: number;
};

type TokenPayload = {
  user: AuthUser;
  exp: number;
};

function encodeBase64Url(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(value: string): string {
  return createHmac("sha256", tokenSecret).update(value).digest("base64url");
}

export function createAuthSession(user: AuthUser): AuthSession {
  const expiresAtMs = Date.now() + tokenTtlMs;
  const header = encodeBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encodeBase64Url(JSON.stringify({ user, exp: expiresAtMs } satisfies TokenPayload));
  const unsigned = `${header}.${payload}`;
  const token = `${unsigned}.${sign(unsigned)}`;
  sessions.set(token, {
    userId: user.id,
    expiresAtMs,
    lastActivityMs: Date.now(),
  });

  return {
    user,
    token,
    permissionScheme: user.roles.includes("ADMIN") ? "ADMIN_FULL" : "USER_STANDARD",
    expiresAt: new Date(expiresAtMs).toISOString(),
    inactivityTimeoutMs,
  };
}

export function verifyAuthToken(token: string): AuthUser | null {
  const session = sessions.get(token);
  if (!session) return null;

  const now = Date.now();
  if (session.expiresAtMs <= now || now - session.lastActivityMs > inactivityTimeoutMs) {
    sessions.delete(token);
    return null;
  }

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const expected = sign(`${header}.${payload}`);
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== receivedBuffer.length || !timingSafeEqual(expectedBuffer, receivedBuffer)) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TokenPayload;
    if (!parsed.user || parsed.exp <= Date.now()) return null;
    session.lastActivityMs = now;
    return parsed.user;
  } catch (_error) {
    return null;
  }
}

export function invalidateAuthToken(token: string): void {
  sessions.delete(token);
}
