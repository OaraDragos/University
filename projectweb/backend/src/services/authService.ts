import { prisma } from "./prismaClient";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { HttpError } from "../utils/errors";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
};

type UserWithAccess = NonNullable<Awaited<ReturnType<typeof findUserWithAccessByUsername>>>;

function mapUserToAuthUser(user: UserWithAccess): AuthUser {
  const roles = user.userRoles.map((userRole) => userRole.role.name);
  const permissions = [
    ...new Set(
      user.userRoles.flatMap((userRole) =>
        userRole.role.rolePermissions.map((rolePermission) => rolePermission.permission.name)
      )
    ),
  ];

  return {
    id: String(user.id),
    username: user.username,
    email: user.email,
    roles,
    permissions,
  };
}

function includeAccess() {
  return {
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  } as const;
}

function findUserWithAccessByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
    ...includeAccess(),
  });
}

function findUserWithAccessByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    ...includeAccess(),
  });
}

function findUserWithAccessById(id: number) {
  return prisma.user.findUnique({
    where: { id },
    ...includeAccess(),
  });
}

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(storedPassword: string, password: string): boolean {
  const [scheme, salt, hash] = storedPassword.split(":");
  if (scheme !== "scrypt" || !salt || !hash) {
    return storedPassword === password;
  }

  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function login(username: string, password: string): Promise<AuthUser | null> {
  const identifier = username.trim();
  const user = identifier.includes("@")
    ? await findUserWithAccessByEmail(identifier)
    : await findUserWithAccessByUsername(identifier);

  if (!user || !verifyPassword(user.password, password)) {
    return null;
  }

  return mapUserToAuthUser(user);
}

export async function getAuthUserByIdentifier(identifier: string): Promise<AuthUser | null> {
  const normalized = identifier.trim();
  const user = normalized.includes("@")
    ? await findUserWithAccessByEmail(normalized)
    : await findUserWithAccessByUsername(normalized);

  if (!user) {
    return null;
  }

  return mapUserToAuthUser(user);
}

export async function updateUserPasswordByEmail(email: string, password: string): Promise<void> {
  const normalizedEmail = email.trim();
  const existing = await findUserWithAccessByEmail(normalizedEmail);
  if (!existing) {
    throw new HttpError(404, "User not found");
  }

  await prisma.user.update({
    where: { email: normalizedEmail },
    data: {
      password: hashPassword(password),
    },
  });
}

export async function register(username: string, email: string, password: string): Promise<AuthUser> {
  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (existing) {
    throw new HttpError(409, "Username or email already exists");
  }

  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
  if (!userRole) {
    throw new HttpError(500, "Default USER role is missing");
  }

  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashPassword(password),
      userRoles: {
        create: {
          roleId: userRole.id,
        },
      },
    },
    ...includeAccess(),
  });

  return mapUserToAuthUser(user);
}

export async function getAuthUserById(userId: string): Promise<AuthUser | null> {
  const id = Number(userId);
  if (!Number.isInteger(id)) {
    return null;
  }

  const user = await findUserWithAccessById(id);
  if (!user) {
    return null;
  }

  return mapUserToAuthUser(user);
}
