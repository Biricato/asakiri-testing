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
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        render={<Link href={`/create/${courseId}`} />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back to course
      </Button>

      <h1 className="text-2xl font-bold">{course.title}</h1>
      <p className="text-muted-foreground mt-2">Course settings and metadata.</p>

      <div className="mt-6 max-w-2xl">
        <CourseSettings course={course} />
      </div>
    </div>
  )
}
