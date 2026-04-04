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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/learn" />}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Button>
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Learning Path
            </p>
            <h1 className="text-lg font-semibold">{c.title}</h1>
          </div>
        </div>
        <Button variant="outline" size="sm" render={<Link href={`/learn/${courseId}/practice`} />}>
          Practice
        </Button>
      </div>

      <div className="mx-auto mt-8 max-w-lg">
        <LearningPath courseId={courseId} units={units} />
      </div>
    </div>
  )
}
