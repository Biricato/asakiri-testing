import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourse } from "@/features/course/actions/courses"
import { UnitList } from "@/features/course/components/unit-list"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings02Icon } from "@hugeicons/core-free-icons"

export default async function CourseOverviewPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourse(courseId)

  if (!course) notFound()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground mt-1">
            {course.sourceLanguage} → {course.targetLanguage} · {course.difficulty}
          </p>
        </div>
        <Button variant="outline" render={<Link href={`/create/${courseId}/settings`} />}>
          <HugeiconsIcon icon={Settings02Icon} size={16} className="mr-1" />
          Settings
        </Button>
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Units</h2>
        <UnitList courseId={courseId} units={course.units} />
      </div>
    </div>
  )
}
