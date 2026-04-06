import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { userStats } from "@/schema/gamification"
import { json, error, requireSession } from "../../helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)

    const rows = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, session.user.id))
      .limit(1)

    const stats = rows[0] ?? {
      xp: 0, level: 1, gems: 0,
      streakCount: 0, streakFreezes: 0, longestStreak: 0,
      lastActiveDate: null,
      totalLessons: 0, totalExercises: 0, totalReviews: 0,
    }

    return json({ stats })
  } catch {
    return error("Unauthorized", 401)
  }
}
