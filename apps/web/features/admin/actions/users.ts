"use server"

import { count, eq, or, ilike } from "drizzle-orm"
import { db } from "@/lib/db"
import { user } from "@/schema/auth"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { PaginatedResult } from "../types"

type UserRow = typeof user.$inferSelect

export async function getUsers({
  page = 1,
  search = "",
  pageSize = 20,
}: {
  page?: number
  search?: string
  pageSize?: number
}): Promise<PaginatedResult<UserRow>> {
  const offset = (page - 1) * pageSize

  const where = search
    ? or(
        ilike(user.name, `%${search}%`),
        ilike(user.email, `%${search}%`),
      )
    : undefined

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(user)
      .where(where)
      .orderBy(user.createdAt)
      .limit(pageSize)
      .offset(offset),
    db.select({ count: count() }).from(user).where(where),
  ])

  return {
    data: rows,
    total: totalResult[0]?.count ?? 0,
    page,
    pageSize,
  }
}

export async function setUserRole(
  userId: string,
  role: "admin" | "creator" | "learner",
): Promise<{ success: boolean }> {
  // Direct Drizzle update since Better Auth admin plugin
  // only supports "user" | "admin" roles, not custom ones
  await db
    .update(user)
    .set({ role, updatedAt: new Date() })
    .where(eq(user.id, userId))
  return { success: true }
}

export async function banUser(
  userId: string,
  reason?: string,
): Promise<{ success: boolean }> {
  await auth.api.banUser({
    headers: await headers(),
    body: { userId, banReason: reason },
  })
  return { success: true }
}

export async function unbanUser(
  userId: string,
): Promise<{ success: boolean }> {
  await auth.api.unbanUser({
    headers: await headers(),
    body: { userId },
  })
  return { success: true }
}
