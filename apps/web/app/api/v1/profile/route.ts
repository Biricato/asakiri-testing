import { NextRequest } from "next/server"
import { eq, and, count, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { lessonProgress, exerciseAttempt, srsReview } from "@/schema/learning"
import { userStats } from "@/schema/gamification"
import { json, error, requireSession } from "../helpers"

export async function GET(req: NextRequest) {
  try {
    const session = await requireSession(req)

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

    const gamification = await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, session.user.id))
      .limit(1)

    const g = gamification[0]

    return json({
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      },
      stats: {
        lessonsCompleted: lessonsResult?.count ?? 0,
        totalAttempts: attemptsResult?.total ?? 0,
        correctAttempts: attemptsResult?.correct ?? 0,
        accuracy: attemptsResult?.total
          ? Math.round(((attemptsResult.correct ?? 0) / attemptsResult.total) * 100)
          : 0,
        dueReviews: dueResult?.count ?? 0,
      },
      gamification: {
        xp: g?.xp ?? 0,
        level: g?.level ?? 1,
        gems: g?.gems ?? 0,
        streakCount: g?.streakCount ?? 0,
        streakFreezes: g?.streakFreezes ?? 0,
        longestStreak: g?.longestStreak ?? 0,
        lastActiveDate: g?.lastActiveDate ?? null,
        totalLessons: g?.totalLessons ?? 0,
        totalExercises: g?.totalExercises ?? 0,
        totalReviews: g?.totalReviews ?? 0,
      },
    })
  } catch {
    return error("Unauthorized", 401)
  }
}
