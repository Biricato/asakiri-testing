import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourse } from "@/features/course/actions/courses"
import { CourseSettings } from "@/features/course/components/course-settings"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourse(courseId)
  if (!course) notFound()

  return (
    <div className="p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/create/${courseId}`} />}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
        </Button>
        <div>
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Course Details
          </p>
          <h1 className="text-lg font-semibold">{course.title}</h1>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-2xl">
        <CourseSettings course={course} />
      </div>
    </div>
  )
}
