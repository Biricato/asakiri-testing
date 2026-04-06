import { NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { exerciseAttempt, srsReview } from "@/schema/learning"
import { json, error, requireSession } from "../../../helpers"

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const { variantId, isCorrect, durationMs, answer } = await req.json()

    // Record attempt
    await db.insert(exerciseAttempt).values({
      userId: session.user.id,
      variantId,
      isCorrect,
      durationMs,
      answer,
    })

    // Create or update SRS entry
    const existing = await db
      .select()
      .from(srsReview)
      .where(
        and(
          eq(srsReview.userId, session.user.id),
          eq(srsReview.variantId, variantId),
        ),
      )
      .limit(1)

    if (existing.length === 0) {
      // First attempt — schedule initial review
      // Correct: review in 1 day. Wrong: review in 4 hours
      const intervalDays = isCorrect ? 1 : 0.17
      const dueAt = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000)

      await db.insert(srsReview).values({
        userId: session.user.id,
        variantId,
        dueAt,
        intervalDays: String(intervalDays),
        easiness: "2.5",
        repetition: isCorrect ? 1 : 0,
        lastReviewedAt: new Date(),
      })
    }
    // If SRS entry already exists, don't modify it here — let the /srs/review endpoint handle it

    return json({ success: true })
  } catch {
    return error("Unauthorized", 401)
  }
}
