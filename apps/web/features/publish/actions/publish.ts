"use server"

import { eq, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { publishedCourse } from "@/schema/learning"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 80)
}

export async function publishCourse(
  courseId: string,
): Promise<{ success: boolean; slug?: string }> {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) throw new Error("Unauthorized")

  const rows = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)
  const c = rows[0]
  if (!c || (c.createdBy !== session.user.id && session.user.role !== "admin")) {
    throw new Error("Forbidden")
  }

  // Check if already published
  const existing = await db
    .select()
    .from(publishedCourse)
    .where(eq(publishedCourse.courseId, courseId))
    .limit(1)

  if (existing.length > 0) {
    // Bump version
    const pub = existing[0]!
    const [maxVersion] = await db
      .select({ max: max(publishedCourse.version) })
      .from(publishedCourse)
      .where(eq(publishedCourse.courseId, courseId))

    await db
      .update(publishedCourse)
      .set({
        version: (maxVersion?.max ?? 0) + 1,
        publishedAt: new Date(),
      })
      .where(eq(publishedCourse.id, pub.id))

    // Mark course as published
    await db
      .update(course)
      .set({ isPublished: true, updatedAt: new Date() })
      .where(eq(course.id, courseId))

    return { success: true, slug: pub.slug }
  }

  // First publish
  const slug = toSlug(c.title) || `course-${courseId.slice(0, 8)}`

  await db.insert(publishedCourse).values({
    courseId,
    slug,
    version: 1,
    isListed: true,
  })

  await db
    .update(course)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(eq(course.id, courseId))

  return { success: true, slug }
}

export async function toggleListed(
  publishedCourseId: string,
  isListed: boolean,
): Promise<{ success: boolean }> {
  await db
    .update(publishedCourse)
    .set({ isListed })
    .where(eq(publishedCourse.id, publishedCourseId))
  return { success: true }
}

export async function unpublishCourse(
  courseId: string,
): Promise<{ success: boolean }> {
  await db
    .delete(publishedCourse)
    .where(eq(publishedCourse.courseId, courseId))

  await db
    .update(course)
    .set({ isPublished: false, updatedAt: new Date() })
    .where(eq(course.id, courseId))

  return { success: true }
}
