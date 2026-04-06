import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { lessonPatreonTier, exerciseGroupPatreonTier, coursePatreon, patreonLearner } from "@/schema/patreon"
import { checkLearnerMembership } from "@/lib/patreon"

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers }).catch(() => null)
}

export async function requireSession(req: NextRequest) {
  const session = await getSession(req)
  if (!session) throw new Error("Unauthorized")
  return session
}

// Check Patreon tier gate for a lesson. Returns null if allowed, or an error response if blocked.
export async function checkLessonPatreonGate(
  lessonId: string,
  courseId: string,
  userId: string,
): Promise<NextResponse | null> {
  const tierReq = await db
    .select()
    .from(lessonPatreonTier)
    .where(eq(lessonPatreonTier.lessonId, lessonId))
    .limit(1)

  if (!tierReq[0]) return null // No gate

  return checkPatreonAccess(courseId, userId, tierReq[0].tierTitle, tierReq[0].tierAmountCents)
}

// Check Patreon tier gate for an exercise group. Returns null if allowed, or an error response if blocked.
export async function checkExercisePatreonGate(
  exerciseGroupId: string,
  courseId: string,
  userId: string,
): Promise<NextResponse | null> {
  const tierReq = await db
    .select()
    .from(exerciseGroupPatreonTier)
    .where(eq(exerciseGroupPatreonTier.exerciseGroupId, exerciseGroupId))
    .limit(1)

  if (!tierReq[0]) return null

  return checkPatreonAccess(courseId, userId, tierReq[0].tierTitle, tierReq[0].tierAmountCents)
}

async function checkPatreonAccess(
  courseId: string,
  userId: string,
  tierTitle: string,
  tierAmountCents: number,
): Promise<NextResponse | null> {
  // Check if user is the course creator (always has access)
  const courseRow = await db
    .select({ createdBy: course.createdBy })
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)

  if (courseRow[0]?.createdBy === userId) return null

  // Get campaign ID
  const cpRows = await db
    .select()
    .from(coursePatreon)
    .where(eq(coursePatreon.courseId, courseId))
    .limit(1)

  if (!cpRows[0]?.campaignId) return null // No campaign linked, allow access

  // Check if learner has Patreon connected
  const learnerConn = await db
    .select()
    .from(patreonLearner)
    .where(eq(patreonLearner.userId, userId))
    .limit(1)

  if (!learnerConn[0]) {
    return NextResponse.json({
      error: "patreon_required",
      tierTitle,
      tierAmountCents,
      connected: false,
    }, { status: 403 })
  }

  // Check membership
  const membership = await checkLearnerMembership(userId, cpRows[0].campaignId)
  if (!membership.isMember || membership.tierAmountCents < tierAmountCents) {
    return NextResponse.json({
      error: "patreon_tier_insufficient",
      tierTitle,
      tierAmountCents,
      connected: true,
      currentAmountCents: membership.tierAmountCents,
    }, { status: 403 })
  }

  return null // Access granted
}
