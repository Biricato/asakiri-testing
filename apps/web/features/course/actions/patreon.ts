"use server"

import { eq, and } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { getCampaignTiers } from "@/lib/patreon"
import {
  patreonConnection,
  coursePatreon,
  lessonPatreonTier,
  type PatreonTier,
} from "@/schema/patreon"

export async function getCreatorPatreonStatus(userId: string) {
  const rows = await db
    .select({
      campaignId: patreonConnection.campaignId,
      connectedAt: patreonConnection.connectedAt,
    })
    .from(patreonConnection)
    .where(eq(patreonConnection.userId, userId))
    .limit(1)
  return rows[0] ?? null
}

export async function getCourseTiers(courseId: string): Promise<PatreonTier[]> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) return []
  return getCampaignTiers(session.user.id)
}

export async function linkCourseToPatreon(courseId: string) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  const conn = await db
    .select()
    .from(patreonConnection)
    .where(eq(patreonConnection.userId, session.user.id))
    .limit(1)
  if (!conn[0]?.campaignId) throw new Error("No Patreon campaign connected")

  const existing = await db
    .select()
    .from(coursePatreon)
    .where(eq(coursePatreon.courseId, courseId))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(coursePatreon)
      .set({ campaignId: conn[0].campaignId })
      .where(eq(coursePatreon.courseId, courseId))
  } else {
    await db.insert(coursePatreon).values({
      courseId,
      campaignId: conn[0].campaignId,
    })
  }
}

export async function unlinkCourseFromPatreon(courseId: string) {
  await db.delete(coursePatreon).where(eq(coursePatreon.courseId, courseId))
  // Also remove all lesson tier assignments for this course
  // We need to get lesson IDs for this course first
  const { lesson } = await import("@/schema/course")
  const lessons = await db.select({ id: lesson.id }).from(lesson).where(eq(lesson.courseId, courseId))
  for (const l of lessons) {
    await db.delete(lessonPatreonTier).where(eq(lessonPatreonTier.lessonId, l.id))
  }
}

export async function getCoursePatreonLink(courseId: string) {
  const rows = await db
    .select()
    .from(coursePatreon)
    .where(eq(coursePatreon.courseId, courseId))
    .limit(1)
  return rows[0] ?? null
}

export async function setLessonTier(
  lessonId: string,
  tier: { id: string; title: string; amountCents: number } | null,
) {
  if (!tier) {
    await db.delete(lessonPatreonTier).where(eq(lessonPatreonTier.lessonId, lessonId))
    return
  }

  const existing = await db
    .select()
    .from(lessonPatreonTier)
    .where(eq(lessonPatreonTier.lessonId, lessonId))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(lessonPatreonTier)
      .set({
        tierId: tier.id,
        tierTitle: tier.title,
        tierAmountCents: tier.amountCents,
      })
      .where(eq(lessonPatreonTier.lessonId, lessonId))
  } else {
    await db.insert(lessonPatreonTier).values({
      lessonId,
      tierId: tier.id,
      tierTitle: tier.title,
      tierAmountCents: tier.amountCents,
    })
  }
}

export async function getLessonTier(lessonId: string) {
  const rows = await db
    .select()
    .from(lessonPatreonTier)
    .where(eq(lessonPatreonTier.lessonId, lessonId))
    .limit(1)
  return rows[0] ?? null
}

export async function getLessonTiersForCourse(courseId: string) {
  const { lesson } = await import("@/schema/course")
  const results = await db
    .select({
      lessonId: lessonPatreonTier.lessonId,
      tierId: lessonPatreonTier.tierId,
      tierTitle: lessonPatreonTier.tierTitle,
      tierAmountCents: lessonPatreonTier.tierAmountCents,
    })
    .from(lessonPatreonTier)
    .innerJoin(lesson, eq(lessonPatreonTier.lessonId, lesson.id))
    .where(eq(lesson.courseId, courseId))

  return Object.fromEntries(results.map((r) => [r.lessonId, r]))
}
