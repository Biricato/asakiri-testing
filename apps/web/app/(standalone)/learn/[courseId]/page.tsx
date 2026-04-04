import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { getLearningPath } from "@/features/learn/actions/enrolled"
import { LearningPath } from "@/features/learn/components/learning-path"
import { PageHeader } from "@/components/page-header"
import { Button } from "@heroui/react"

export default async function CourseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const rows = await db.select().from(course).where(eq(course.id, courseId)).limit(1)
  const c = rows[0]
  if (!c) notFound()

  const units = await getLearningPath(courseId)

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref="/learn" label="Learning Path" title={c.title}>
        <Link href={`/learn/${courseId}/practice`}><Button variant="outline" size="sm">
          Practice
        </Button></Link>
      </PageHeader>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-lg">
          <LearningPath courseId={courseId} units={units} />
        </div>
      </main>
    </div>
  )
}
