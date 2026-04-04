"use server"

import { eq, and, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { srsReview, exerciseAttempt } from "@/schema/learning"
import { exerciseVariant } from "@/schema/exercise"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { computeSm2Update } from "../sm2"

export async function submitAndUpdateSrs(data: {
  variantId: string
  isCorrect: boolean
  durationMs: number
  answer: unknown
}): Promise<{ success: boolean; nextDue: Date }> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  // Record attempt
  await db.insert(exerciseAttempt).values({
    userId: session.user.id,
    variantId: data.variantId,
    isCorrect: data.isCorrect,
    durationMs: data.durationMs,
    answer: data.answer,
  })

  // Get or create SRS state
  const existing = await db
    .select()
    .from(srsReview)
    .where(
      and(
        eq(srsReview.userId, session.user.id),
        eq(srsReview.variantId, data.variantId),
      ),
    )
    .limit(1)

  const currentState = existing[0]
    ? {
        intervalDays: Number(existing[0].intervalDays),
        easiness: Number(existing[0].easiness),
        repetition: existing[0].repetition,
      }
    : { intervalDays: 1, easiness: 2.5, repetition: 0 }

  const newState = computeSm2Update(currentState, data.isCorrect, data.durationMs)

  if (existing.length > 0) {
    await db
      .update(srsReview)
      .set({
        intervalDays: String(newState.intervalDays),
        easiness: String(newState.easiness),
        repetition: newState.repetition,
        dueAt: newState.dueAt,
        lastReviewedAt: new Date(),
      })
      .where(
        and(
          eq(srsReview.userId, session.user.id),
          eq(srsReview.variantId, data.variantId),
        ),
      )
  } else {
    await db.insert(srsReview).values({
      userId: session.user.id,
      variantId: data.variantId,
      intervalDays: String(newState.intervalDays),
      easiness: String(newState.easiness),
      repetition: newState.repetition,
      dueAt: newState.dueAt,
      lastReviewedAt: new Date(),
    })
  }

  return { success: true, nextDue: newState.dueAt }
}

export async function getDueVariants(courseId: string) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) return []

  return db
    .select({
      variantId: srsReview.variantId,
      dueAt: srsReview.dueAt,
      type: exerciseVariant.type,
      prompt: exerciseVariant.prompt,
      solution: exerciseVariant.solution,
    })
    .from(srsReview)
    .innerJoin(exerciseVariant, eq(srsReview.variantId, exerciseVariant.id))
    .where(
      and(
        eq(srsReview.userId, session.user.id),
        eq(exerciseVariant.groupId, courseId), // filter by group's courseId
        sql`${srsReview.dueAt} <= now()`,
      ),
    )
    .orderBy(srsReview.dueAt)
}
