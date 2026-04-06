import { NextRequest } from "next/server"
import { eq, and, sql, count } from "drizzle-orm"
import { db } from "@/lib/db"
import { srsReview } from "@/schema/learning"
import { json, error, requireSession } from "../../../helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)

    const reviews = await db
      .select({
        intervalDays: srsReview.intervalDays,
        dueAt: srsReview.dueAt,
        repetition: srsReview.repetition,
      })
      .from(srsReview)
      .where(eq(srsReview.userId, session.user.id))

    const now = Date.now()
    let apprentice = 0
    let guru = 0
    let master = 0
    let enlightened = 0
    let burned = 0
    let dueNow = 0
    let dueNextHour = 0
    let dueNextDay = 0

    for (const r of reviews) {
      const interval = Number(r.intervalDays)
      const dueTime = new Date(r.dueAt).getTime()

      // SRS stages based on interval (similar to WaniKani)
      if (interval <= 1) apprentice++
      else if (interval <= 7) guru++
      else if (interval <= 30) master++
      else if (interval <= 120) enlightened++
      else burned++

      // Due counts
      if (dueTime <= now) dueNow++
      else if (dueTime <= now + 60 * 60 * 1000) dueNextHour++
      else if (dueTime <= now + 24 * 60 * 60 * 1000) dueNextDay++
    }

    return json({
      total: reviews.length,
      dueNow,
      dueNextHour,
      dueNextDay,
      stages: {
        apprentice,
        guru,
        master,
        enlightened,
        burned,
      },
    })
  } catch {
    return error("Unauthorized", 401)
  }
}
