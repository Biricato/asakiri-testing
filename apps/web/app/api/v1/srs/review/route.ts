import { NextRequest } from "next/server"
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { srsReview } from "@/schema/learning"
import { recordActivity } from "@/lib/gamification"
import { json, error, requireSession } from "../../helpers"

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const { variantId, quality } = await req.json()
    // quality: 0-5 (SM-2 algorithm)

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

    const current = existing[0]
    const easiness = current ? Number(current.easiness) : 2.5
    const repetition = current?.repetition ?? 0
    const interval = current ? Number(current.intervalDays) : 1

    // SM-2 algorithm
    let newEasiness = easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEasiness < 1.3) newEasiness = 1.3

    let newRepetition: number
    let newInterval: number

    if (quality < 3) {
      newRepetition = 0
      newInterval = 1
    } else {
      newRepetition = repetition + 1
      if (newRepetition === 1) newInterval = 1
      else if (newRepetition === 2) newInterval = 6
      else newInterval = Math.round(interval * newEasiness)
    }

    const dueAt = new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)

    if (current) {
      await db
        .update(srsReview)
        .set({
          dueAt,
          intervalDays: String(newInterval),
          easiness: String(newEasiness),
          repetition: newRepetition,
          lastReviewedAt: new Date(),
        })
        .where(
          and(
            eq(srsReview.userId, session.user.id),
            eq(srsReview.variantId, variantId),
          ),
        )
    } else {
      await db.insert(srsReview).values({
        userId: session.user.id,
        variantId,
        dueAt,
        intervalDays: String(newInterval),
        easiness: String(newEasiness),
        repetition: newRepetition,
        lastReviewedAt: new Date(),
      })
    }

    const rewards = await recordActivity(session.user.id, "srs_review")
    return json({ success: true, nextDue: dueAt, interval: newInterval, ...rewards })
  } catch {
    return error("Unauthorized", 401)
  }
}
