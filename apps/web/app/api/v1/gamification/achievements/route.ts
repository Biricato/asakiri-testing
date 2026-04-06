import { NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { achievement, userAchievement } from "@/schema/gamification"
import { json, error, requireSession } from "../../helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)

    const allAchievements = await db
      .select()
      .from(achievement)
      .orderBy(achievement.sortOrder)

    const unlocked = await db
      .select()
      .from(userAchievement)
      .where(eq(userAchievement.userId, session.user.id))

    const unlockedIds = new Set(unlocked.map((u) => u.achievementId))

    const result = allAchievements.map((a) => ({
      ...a,
      unlocked: unlockedIds.has(a.id),
      unlockedAt: unlocked.find((u) => u.achievementId === a.id)?.unlockedAt ?? null,
    }))

    return json({ achievements: result })
  } catch {
    return error("Unauthorized", 401)
  }
}
