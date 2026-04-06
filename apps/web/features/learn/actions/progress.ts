"use server"

import { eq, and, count, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { lessonProgress, exerciseAttempt, srsReview } from "@/schema/learning"
import { section } from "@/schema/course"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { recordActivity } from "@/lib/gamification"

export async function markLessonComplete(
  lessonId: string,
): Promise<{ success: boolean }> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  // Upsert
  const existing = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.userId, session.user.id),
        eq(lessonProgress.lessonId, lessonId),
      ),
    )
    .limit(1)

  if (existing.length === 0) {
    await db.insert(lessonProgress).values({
      userId: session.user.id,
      lessonId,
    })
    await recordActivity(session.user.id, "lesson_complete")
  }

  return { success: true }
}

export async function submitExerciseAttempt(data: {
  variantId: string
  isCorrect: boolean
  durationMs: number
  answer: unknown
}): Promise<{ success: boolean }> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  await db.insert(exerciseAttempt).values({
    userId: session.user.id,
    variantId: data.variantId,
    isCorrect: data.isCorrect,
    durationMs: data.durationMs,
    answer: data.answer,
  })

  // Create SRS entry on first attempt
  const existingSrs = await db
    .select()
    .from(srsReview)
    .where(
      and(
        eq(srsReview.userId, session.user.id),
        eq(srsReview.variantId, data.variantId),
      ),
    )
    .limit(1)

  if (existingSrs.length === 0) {
    const intervalDays = data.isCorrect ? 1 : 0.17
    await db.insert(srsReview).values({
      userId: session.user.id,
      variantId: data.variantId,
      dueAt: new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000),
      intervalDays: String(intervalDays),
      easiness: "2.5",
      repetition: data.isCorrect ? 1 : 0,
      lastReviewedAt: new Date(),
    })
  }

  await recordActivity(session.user.id, "exercise_complete")
  return { success: true }
}

export async function getLessonContent(lessonId: string) {
  return db
    .select()
    .from(section)
    .where(eq(section.lessonId, lessonId))
    .orderBy(section.order)
}

export async function getStats(courseId?: string) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) return null

  const [lessonsResult] = await db
    .select({ count: count() })
    .from(lessonProgress)
    .where(eq(lessonProgress.userId, session.user.id))

  const [attemptsResult] = await db
    .select({
      total: count(),
      correct: count(sql`CASE WHEN ${exerciseAttempt.isCorrect} THEN 1 END`),
    })
    .from(exerciseAttempt)
    .where(eq(exerciseAttempt.userId, session.user.id))

  const [dueResult] = await db
    .select({ count: count() })
    .from(srsReview)
    .where(
      and(
        eq(srsReview.userId, session.user.id),
        sql`${srsReview.dueAt} <= now()`,
      ),
    )

  return {
    lessonsCompleted: lessonsResult?.count ?? 0,
    totalAttempts: attemptsResult?.total ?? 0,
    correctAttempts: attemptsResult?.correct ?? 0,
    accuracy:
      attemptsResult?.total
        ? Math.round(((attemptsResult.correct ?? 0) / attemptsResult.total) * 100)
        : 0,
    dueReviews: dueResult?.count ?? 0,
  }
}
