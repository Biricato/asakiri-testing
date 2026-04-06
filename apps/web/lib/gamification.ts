import { eq, and } from "drizzle-orm"
import { db } from "./db"
import { userStats, xpLog, achievement, userAchievement } from "@/schema/gamification"

// XP needed per level: level 1=0, level 2=100, level 3=250, level 4=500...
function xpForLevel(level: number): number {
  return Math.floor(50 * level * (level - 1))
}

function levelFromXp(xp: number): number {
  let level = 1
  while (xpForLevel(level + 1) <= xp) level++
  return level
}

// Reward table
const REWARDS = {
  lesson_complete: { xp: 10, gems: 2 },
  exercise_complete: { xp: 15, gems: 3 },
  exercise_perfect: { xp: 5, gems: 2 },
  srs_review: { xp: 3, gems: 1 },
  daily_bonus: { xp: 10, gems: 5 },
  streak_milestone: { xp: 0, gems: 0 }, // dynamic based on milestone
} as const

type ActivitySource = keyof typeof REWARDS

export async function recordActivity(
  userId: string,
  source: ActivitySource,
  extra?: { reviewCount?: number },
): Promise<{ xpEarned: number; gemsEarned: number; newAchievements: string[] }> {
  // Ensure user_stats row exists
  const existing = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .limit(1)

  if (existing.length === 0) {
    await db.insert(userStats).values({ userId })
  }

  const stats = (await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1))[0]!

  let xpEarned = REWARDS[source]?.xp ?? 0
  let gemsEarned = REWARDS[source]?.gems ?? 0

  // For SRS reviews, multiply by review count
  if (source === "srs_review" && extra?.reviewCount) {
    xpEarned *= extra.reviewCount
    gemsEarned *= extra.reviewCount
  }

  // Check daily bonus
  const today = new Date().toISOString().split("T")[0]!
  let isDailyFirst = false
  if (stats.lastActiveDate !== today) {
    isDailyFirst = true
    xpEarned += REWARDS.daily_bonus.xp
    gemsEarned += REWARDS.daily_bonus.gems
  }

  // Update streak
  let newStreak = stats.streakCount
  let freezesUsed = 0
  if (stats.lastActiveDate !== today) {
    const lastDate = stats.lastActiveDate ? new Date(stats.lastActiveDate) : null
    const todayDate = new Date(today)

    if (lastDate) {
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 1) {
        // Consecutive day
        newStreak = stats.streakCount + 1
      } else if (diffDays === 2 && stats.streakFreezes > 0) {
        // Missed 1 day but have a freeze
        newStreak = stats.streakCount + 1
        freezesUsed = 1
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1
      }
    } else {
      newStreak = 1
    }
  }

  // Streak milestone gems
  const streakGemMilestones: Record<number, number> = {
    3: 5, 7: 10, 14: 20, 30: 50, 60: 100, 100: 200, 365: 500,
  }
  if (streakGemMilestones[newStreak]) {
    gemsEarned += streakGemMilestones[newStreak]!
    await db.insert(xpLog).values({
      userId,
      amount: 0,
      gems: streakGemMilestones[newStreak]!,
      source: "streak_milestone",
    })
  }

  // Increment counters
  const counterUpdates: Record<string, number> = {}
  if (source === "lesson_complete") counterUpdates.totalLessons = (stats.totalLessons ?? 0) + 1
  if (source === "exercise_complete" || source === "exercise_perfect") counterUpdates.totalExercises = (stats.totalExercises ?? 0) + 1
  if (source === "srs_review") counterUpdates.totalReviews = (stats.totalReviews ?? 0) + (extra?.reviewCount ?? 1)

  const newXp = (stats.xp ?? 0) + xpEarned
  const newLevel = levelFromXp(newXp)
  const newLongest = Math.max(stats.longestStreak ?? 0, newStreak)

  await db
    .update(userStats)
    .set({
      xp: newXp,
      level: newLevel,
      gems: (stats.gems ?? 0) + gemsEarned,
      streakCount: newStreak,
      streakFreezes: (stats.streakFreezes ?? 0) - freezesUsed,
      longestStreak: newLongest,
      lastActiveDate: today,
      ...counterUpdates,
    })
    .where(eq(userStats.userId, userId))

  // Log XP
  if (xpEarned > 0 || gemsEarned > 0) {
    await db.insert(xpLog).values({ userId, amount: xpEarned, gems: gemsEarned, source })
  }
  if (isDailyFirst) {
    await db.insert(xpLog).values({ userId, amount: REWARDS.daily_bonus.xp, gems: REWARDS.daily_bonus.gems, source: "daily_bonus" })
  }

  // Check achievements
  const newAchievements = await checkAchievements(userId, {
    ...stats,
    ...counterUpdates,
    streakCount: newStreak,
    xp: newXp,
  })

  return { xpEarned, gemsEarned, newAchievements }
}

export async function buyStreakFreeze(userId: string): Promise<{ success: boolean; error?: string }> {
  const FREEZE_COST = 50

  const stats = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1)
  if (!stats[0]) return { success: false, error: "No stats found" }
  if ((stats[0].gems ?? 0) < FREEZE_COST) return { success: false, error: `Not enough gems. Need ${FREEZE_COST}.` }
  if ((stats[0].streakFreezes ?? 0) >= 2) return { success: false, error: "Max 2 streak freezes." }

  await db
    .update(userStats)
    .set({
      gems: (stats[0].gems ?? 0) - FREEZE_COST,
      streakFreezes: (stats[0].streakFreezes ?? 0) + 1,
    })
    .where(eq(userStats.userId, userId))

  return { success: true }
}

// Achievement checking
async function checkAchievements(
  userId: string,
  stats: { totalLessons?: number; totalExercises?: number; totalReviews?: number; streakCount?: number; xp?: number },
): Promise<string[]> {
  const checks: { id: string; condition: boolean }[] = [
    { id: "first_lesson", condition: (stats.totalLessons ?? 0) >= 1 },
    { id: "lessons_10", condition: (stats.totalLessons ?? 0) >= 10 },
    { id: "lessons_50", condition: (stats.totalLessons ?? 0) >= 50 },
    { id: "exercises_10", condition: (stats.totalExercises ?? 0) >= 10 },
    { id: "exercises_100", condition: (stats.totalExercises ?? 0) >= 100 },
    { id: "reviews_100", condition: (stats.totalReviews ?? 0) >= 100 },
    { id: "reviews_1000", condition: (stats.totalReviews ?? 0) >= 1000 },
    { id: "streak_3", condition: (stats.streakCount ?? 0) >= 3 },
    { id: "streak_7", condition: (stats.streakCount ?? 0) >= 7 },
    { id: "streak_30", condition: (stats.streakCount ?? 0) >= 30 },
    { id: "streak_100", condition: (stats.streakCount ?? 0) >= 100 },
    { id: "xp_1000", condition: (stats.xp ?? 0) >= 1000 },
    { id: "xp_10000", condition: (stats.xp ?? 0) >= 10000 },
  ]

  const unlocked: string[] = []
  for (const check of checks) {
    if (!check.condition) continue

    // Check if achievement exists and not already unlocked
    const achRows = await db.select().from(achievement).where(eq(achievement.id, check.id)).limit(1)
    if (!achRows[0]) continue

    const already = await db
      .select()
      .from(userAchievement)
      .where(and(eq(userAchievement.userId, userId), eq(userAchievement.achievementId, check.id)))
      .limit(1)
    if (already.length > 0) continue

    // Unlock
    await db.insert(userAchievement).values({ userId, achievementId: check.id })

    // Award XP/gems
    if (achRows[0].xpReward > 0 || achRows[0].gemReward > 0) {
      await db
        .update(userStats)
        .set({
          xp: (stats.xp ?? 0) + achRows[0].xpReward,
          gems: ((await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1))[0]?.gems ?? 0) + achRows[0].gemReward,
        })
        .where(eq(userStats.userId, userId))
    }

    unlocked.push(check.id)
  }

  return unlocked
}
