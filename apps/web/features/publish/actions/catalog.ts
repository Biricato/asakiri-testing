"use server"

import { eq, and, ilike, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { publishedCourse } from "@/schema/learning"
import { user } from "@/schema/auth"
import type { CatalogCourse } from "../types"

export async function getCatalog({
  search = "",
  difficulty = "",
  language = "",
}: {
  search?: string
  difficulty?: string
  language?: string
} = {}): Promise<CatalogCourse[]> {
  let query = db
    .select({
      id: publishedCourse.id,
      slug: publishedCourse.slug,
      version: publishedCourse.version,
      isListed: publishedCourse.isListed,
      publishedAt: publishedCourse.publishedAt,
      courseId: course.id,
      title: course.title,
      subtitle: course.subtitle,
      targetLanguage: course.targetLanguage,
      sourceLanguage: course.sourceLanguage,
      difficulty: course.difficulty,
      coverImageUrl: course.coverImageUrl,
      creatorName: user.name,
    })
    .from(publishedCourse)
    .innerJoin(course, eq(publishedCourse.courseId, course.id))
    .leftJoin(user, eq(course.createdBy, user.id))
    .where(eq(publishedCourse.isListed, true))
    .$dynamic()

  if (search) {
    query = query.where(
      or(
        ilike(course.title, `%${search}%`),
        ilike(course.targetLanguage, `%${search}%`),
      ),
    )
  }

  if (difficulty) {
    query = query.where(eq(course.difficulty, difficulty))
  }

  if (language) {
    query = query.where(eq(course.targetLanguage, language))
  }

  return query
}

export async function getCourseBySlug(
  slug: string,
): Promise<CatalogCourse | null> {
  const rows = await db
    .select({
      id: publishedCourse.id,
      slug: publishedCourse.slug,
      version: publishedCourse.version,
      isListed: publishedCourse.isListed,
      publishedAt: publishedCourse.publishedAt,
      courseId: course.id,
      title: course.title,
      subtitle: course.subtitle,
      targetLanguage: course.targetLanguage,
      sourceLanguage: course.sourceLanguage,
      difficulty: course.difficulty,
      coverImageUrl: course.coverImageUrl,
      creatorName: user.name,
    })
    .from(publishedCourse)
    .innerJoin(course, eq(publishedCourse.courseId, course.id))
    .leftJoin(user, eq(course.createdBy, user.id))
    .where(eq(publishedCourse.slug, slug))
    .limit(1)

  return rows[0] ?? null
}
