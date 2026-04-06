import { db } from "./db"
import { achievement } from "@/schema/gamification"

const ACHIEVEMENTS = [
  { id: "first_lesson", title: "First Steps", description: "Complete your first lesson", icon: "book", xpReward: 10, gemReward: 5, sortOrder: 1 },
  { id: "lessons_10", title: "Dedicated Learner", description: "Complete 10 lessons", icon: "book", xpReward: 25, gemReward: 10, sortOrder: 2 },
  { id: "lessons_50", title: "Knowledge Seeker", description: "Complete 50 lessons", icon: "book", xpReward: 100, gemReward: 50, sortOrder: 3 },
  { id: "exercises_10", title: "Practice Makes Perfect", description: "Complete 10 exercises", icon: "grid", xpReward: 25, gemReward: 10, sortOrder: 4 },
  { id: "exercises_100", title: "Exercise Champion", description: "Complete 100 exercises", icon: "grid", xpReward: 100, gemReward: 50, sortOrder: 5 },
  { id: "reviews_100", title: "Reviewer", description: "Complete 100 SRS reviews", icon: "repeat", xpReward: 25, gemReward: 10, sortOrder: 6 },
  { id: "reviews_1000", title: "SRS Master", description: "Complete 1000 SRS reviews", icon: "repeat", xpReward: 200, gemReward: 100, sortOrder: 7 },
  { id: "streak_3", title: "Getting Started", description: "Reach a 3-day streak", icon: "fire", xpReward: 10, gemReward: 5, sortOrder: 8 },
  { id: "streak_7", title: "One Week Strong", description: "Reach a 7-day streak", icon: "fire", xpReward: 25, gemReward: 15, sortOrder: 9 },
  { id: "streak_30", title: "Monthly Warrior", description: "Reach a 30-day streak", icon: "fire", xpReward: 100, gemReward: 50, sortOrder: 10 },
  { id: "streak_100", title: "Unstoppable", description: "Reach a 100-day streak", icon: "fire", xpReward: 500, gemReward: 200, sortOrder: 11 },
  { id: "xp_1000", title: "Rising Star", description: "Earn 1,000 XP", icon: "star", xpReward: 0, gemReward: 20, sortOrder: 12 },
  { id: "xp_10000", title: "Legend", description: "Earn 10,000 XP", icon: "star", xpReward: 0, gemReward: 100, sortOrder: 13 },
]

export async function seedAchievements() {
  for (const a of ACHIEVEMENTS) {
    await db
      .insert(achievement)
      .values(a)
      .onConflictDoNothing()
  }
}
