"use server"

import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { enrollment } from "@/schema/learning"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import type { Enrollment } from "../types"

export async function enroll(
  publishedCourseId: string,
): Promise<{ success: boolean; status: string }> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  // Check if already enrolled
  const existing = await db
    .select()
    .from(enrollment)
    .where(
      and(
        eq(enrollment.publishedCourseId, publishedCourseId),
        eq(enrollment.userId, session.user.id),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    return { success: true, status: existing[0]!.status }
  }

  // For now, open enrollment (instant active)
  // TODO: Check site settings for admin_managed enrollment
  const rows = await db
    .insert(enrollment)
    .values({
      publishedCourseId,
      userId: session.user.id,
      status: "active",
    })
    .returning()

  return { success: true, status: rows[0]!.status }
}

export async function getMyEnrollment(
  publishedCourseId: string,
): Promise<Enrollment | null> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) return null

  const rows = await db
    .select()
    .from(enrollment)
    .where(
      and(
        eq(enrollment.publishedCourseId, publishedCourseId),
        eq(enrollment.userId, session.user.id),
      ),
    )
    .limit(1)

  return rows[0] ?? null
}

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) return []

  return db
    .select()
    .from(enrollment)
    .where(eq(enrollment.userId, session.user.id))
}
