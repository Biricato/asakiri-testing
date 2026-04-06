"use server"

import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { course, courseCollaborator } from "@/schema/course"

export type CourseRole = "owner" | "editor" | "viewer" | null

export async function getCourseRole(courseId: string, userId: string): Promise<CourseRole> {
  // Check if owner
  const rows = await db
    .select({ createdBy: course.createdBy })
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)

  if (!rows[0]) return null
  if (rows[0].createdBy === userId) return "owner"

  // Check collaborator
  const collab = await db
    .select({ role: courseCollaborator.role })
    .from(courseCollaborator)
    .where(
      and(
        eq(courseCollaborator.courseId, courseId),
        eq(courseCollaborator.userId, userId),
      ),
    )
    .limit(1)

  return (collab[0]?.role as CourseRole) ?? null
}

export async function canEditCourse(courseId: string, userId: string, userRole?: string): Promise<boolean> {
  if (userRole === "admin") return true
  const role = await getCourseRole(courseId, userId)
  return role === "owner" || role === "editor"
}

export async function canDeleteCourse(courseId: string, userId: string, userRole?: string): Promise<boolean> {
  if (userRole === "admin") return true
  const role = await getCourseRole(courseId, userId)
  return role === "owner"
}
