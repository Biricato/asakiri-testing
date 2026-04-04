"use server"

import { eq, desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { invite } from "@/schema/settings"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { InviteWithStatus, InviteStatus } from "../types"

function computeStatus(row: {
  usedAt: Date | null
  expiresAt: Date
}): InviteStatus {
  if (row.usedAt) return "used"
  if (row.expiresAt < new Date()) return "expired"
  return "pending"
}

export async function getInvites(): Promise<InviteWithStatus[]> {
  const rows = await db
    .select()
    .from(invite)
    .orderBy(desc(invite.createdAt))

  return rows.map((row) => ({
    id: row.id,
    email: row.email,
    role: row.role,
    code: row.code,
    status: computeStatus(row),
    usedAt: row.usedAt,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  }))
}

export async function createInvite({
  email,
  role,
  expiresInDays = 7,
}: {
  email: string
  role: string
  expiresInDays?: number
}): Promise<InviteWithStatus> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  if (!session) throw new Error("Unauthorized")

  const code = crypto.randomUUID()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  const rows = await db
    .insert(invite)
    .values({
      email,
      role,
      code,
      invitedBy: session.user.id,
      expiresAt,
    })
    .returning()

  const row = rows[0]!

  return {
    id: row.id,
    email: row.email,
    role: row.role,
    code: row.code,
    status: "pending" as const,
    usedAt: null,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  }
}

export async function revokeInvite(
  inviteId: string,
): Promise<{ success: boolean }> {
  await db.delete(invite).where(eq(invite.id, inviteId))
  return { success: true }
}
