import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { getLearningPath } from "@/features/learn/actions/enrolled"
import { LearningPath } from "@/features/learn/components/learning-path"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function CourseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const rows = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)
  const c = rows[0]
  if (!c) notFound()

  const units = await getLearningPath(courseId)

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        render={<Link href="/learn" />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back to courses
      </Button>

      <h1 className="text-2xl font-bold">{c.title}</h1>
      <p className="text-muted-foreground mt-1">
        {c.sourceLanguage} → {c.targetLanguage}
      </p>

      <div className="mt-4">
        <Button
          variant="outline"
          size="sm"
          render={<Link href={`/learn/${courseId}/practice`} />}
        >
          Practice (SRS)
        </Button>
      </div>

      <div className="mt-6">
        <LearningPath courseId={courseId} units={units} />
      </div>
    </div>
  )
}
