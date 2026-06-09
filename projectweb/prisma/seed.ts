import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  "CREATE_ENTITY",
  "READ_ENTITY",
  "UPDATE_ENTITY",
  "DELETE_ENTITY",
  "MANAGE_USERS",
  "VIEW_CHAT",
  "SEND_MESSAGE",
] as const;

const USER_PERMISSIONS = [
  "CREATE_ENTITY",
  "READ_ENTITY",
  "UPDATE_ENTITY",
  "DELETE_ENTITY",
  "VIEW_CHAT",
  "SEND_MESSAGE",
] as const;

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

async function main() {
  for (const roleName of ["ADMIN", "USER"]) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  for (const permissionName of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { name: permissionName },
      update: {},
      create: { name: permissionName },
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({ where: { name: "ADMIN" } });
  const userRole = await prisma.role.findUniqueOrThrow({ where: { name: "USER" } });

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {
      email: "admin@test.com",
      password: hashPassword("admin123"),
    },
    create: {
      username: "admin",
      email: "admin@test.com",
      password: hashPassword("admin123"),
    },
  });

  await prisma.user.upsert({
    where: { username: "user" },
    update: {
      email: "user@test.com",
      password: hashPassword("user123"),
    },
    create: {
      username: "user",
      email: "user@test.com",
      password: hashPassword("user123"),
    },
  });

  const adminUser = await prisma.user.findUniqueOrThrow({ where: { username: "admin" } });
  const normalUser = await prisma.user.findUniqueOrThrow({ where: { username: "user" } });

  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();

  await prisma.userRole.createMany({
    data: [
      { userId: adminUser.id, roleId: adminRole.id },
      { userId: normalUser.id, roleId: userRole.id },
    ],
  });

  const allPermissionRows = await prisma.permission.findMany({ where: { name: { in: [...ALL_PERMISSIONS] } } });
  const userPermissionRows = await prisma.permission.findMany({ where: { name: { in: [...USER_PERMISSIONS] } } });

  await prisma.rolePermission.createMany({
    data: [
      ...allPermissionRows.map((permission) => ({
        roleId: adminRole.id,
        permissionId: permission.id,
      })),
      ...userPermissionRows.map((permission) => ({
        roleId: userRole.id,
        permissionId: permission.id,
      })),
    ],
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
