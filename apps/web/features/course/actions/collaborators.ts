"use server"

import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { courseCollaborator } from "@/schema/course"
import { user } from "@/schema/auth"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getCourseRole } from "./permissions"

export type Collaborator = {
  id: string
  userId: string
  name: string
  email: string
  role: string
  invitedAt: Date
}

export async function getCollaborators(courseId: string): Promise<Collaborator[]> {
  const rows = await db
    .select({
      id: courseCollaborator.id,
      userId: courseCollaborator.userId,
      name: user.name,
      email: user.email,
      role: courseCollaborator.role,
      invitedAt: courseCollaborator.invitedAt,
    })
    .from(courseCollaborator)
    .innerJoin(user, eq(courseCollaborator.userId, user.id))
    .where(eq(courseCollaborator.courseId, courseId))

  return rows
}

export async function addCollaborator(
  courseId: string,
  email: string,
  role: "editor" | "viewer",
): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  // Only owner and admin can manage collaborators
  const myRole = await getCourseRole(courseId, session.user.id)
  if (myRole !== "owner" && session.user.role !== "admin") {
    return { success: false, error: "Only the course owner can add collaborators" }
  }

  // Find user by email
  const users = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email.trim().toLowerCase()))
    .limit(1)

  if (!users[0]) {
    return { success: false, error: "No user found with that email" }
  }

  if (users[0].id === session.user.id) {
    return { success: false, error: "You can't add yourself as a collaborator" }
  }

  // Check if already a collaborator
  const existing = await db
    .select()
    .from(courseCollaborator)
    .where(
      and(
        eq(courseCollaborator.courseId, courseId),
        eq(courseCollaborator.userId, users[0].id),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    return { success: false, error: "This user is already a collaborator" }
  }

  await db.insert(courseCollaborator).values({
    courseId,
    userId: users[0].id,
    role,
  })

  return { success: true }
}

export async function updateCollaboratorRole(
  collaboratorId: string,
  role: "editor" | "viewer",
): Promise<{ success: boolean }> {
  await db
    .update(courseCollaborator)
    .set({ role })
    .where(eq(courseCollaborator.id, collaboratorId))
  return { success: true }
}

export async function removeCollaborator(
  collaboratorId: string,
): Promise<{ success: boolean }> {
  await db
    .delete(courseCollaborator)
    .where(eq(courseCollaborator.id, collaboratorId))
  return { success: true }
}
