import { prisma } from "@/lib/db/prisma";
import { formatDbDate, formatDbDateTime } from "@/lib/db/mappers";
import type { AppUser, CreateUserInput, UpdateUserInput } from "@/types/users";

const userInclude = {
  role: { select: { id: true, name: true, slug: true } }
} as const;

function mapUser(row: {
  id: string;
  email: string;
  name: string;
  roleId: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: { name: string; slug: string };
}): AppUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    roleId: row.roleId,
    roleName: row.role.name,
    roleSlug: row.role.slug,
    active: row.active,
    createdAt: formatDbDate(row.createdAt),
    updatedAt: formatDbDateTime(row.updatedAt)
  };
}

export async function listUsers(): Promise<AppUser[]> {
  const rows = await prisma.user.findMany({
    include: userInclude,
    orderBy: { name: "asc" }
  });

  return rows.map(mapUser);
}

export async function getUser(id: string): Promise<AppUser | null> {
  const row = await prisma.user.findUnique({
    where: { id },
    include: userInclude
  });

  return row ? mapUser(row) : null;
}

export async function createUser(input: CreateUserInput): Promise<AppUser> {
  const row = await prisma.user.create({
    data: {
      email: input.email.trim().toLowerCase(),
      name: input.name.trim(),
      roleId: input.roleId,
      active: input.active ?? true,
      authId: input.authId ?? null,
      passwordHash: input.password ?? null
    },
    include: userInclude
  });

  return mapUser(row);
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<AppUser | null> {
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return null;

  const row = await prisma.user.update({
    where: { id },
    data: {
      email: input.email?.trim().toLowerCase(),
      name: input.name?.trim(),
      roleId: input.roleId,
      active: input.active,
      passwordHash: input.password !== undefined ? input.password : undefined
    },
    include: userInclude
  });

  return mapUser(row);
}
