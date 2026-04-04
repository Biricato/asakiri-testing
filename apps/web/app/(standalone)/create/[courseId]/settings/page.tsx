import { notFound } from "next/navigation"
import { getCourse } from "@/features/course/actions/courses"
import { CourseSettings } from "@/features/course/components/course-settings"
import { PageHeader } from "@/components/page-header"

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourse(courseId)
  if (!course) notFound()

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/create/${courseId}`} label="Course Details" title={course.title} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl">
          <CourseSettings course={course} />
        </div>
      </main>
    </div>
  )
}
