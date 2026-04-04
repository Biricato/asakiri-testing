import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourse } from "@/features/course/actions/courses"
import { UnitList } from "@/features/course/components/unit-list"
import { PublishButton } from "@/features/publish/components/publish-button"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, Settings02Icon } from "@hugeicons/core-free-icons"

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
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon-sm" render={<Link href="/create" />}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </Button>
          <div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Course Builder
            </p>
            <h1 className="text-lg font-semibold">{course.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <PublishButton courseId={courseId} isPublished={course.isPublished} />
          <Button variant="outline" size="sm" render={<Link href={`/create/${courseId}/settings`} />}>
            <HugeiconsIcon icon={Settings02Icon} size={16} />
          </Button>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-3xl">
        <UnitList courseId={courseId} units={course.units} />
      </div>
    </div>
  )
}
