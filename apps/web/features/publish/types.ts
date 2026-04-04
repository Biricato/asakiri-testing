import type { publishedCourse, enrollment } from "@/schema/learning"
import type { course } from "@/schema/course"

export type PublishedCourse = typeof publishedCourse.$inferSelect
export type Enrollment = typeof enrollment.$inferSelect

export type CatalogCourse = {
  id: string
  slug: string
  version: number
  isListed: boolean
  publishedAt: Date
  courseId: string
  title: string
  subtitle: string | null
  targetLanguage: string
  sourceLanguage: string
  difficulty: string
  coverImageUrl: string | null
  creatorName: string | null
}
