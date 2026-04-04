import { getMyCourses } from "@/features/course/actions/courses"
import { CourseList } from "@/features/course/components/course-list"
import { CreateCourseDialog } from "@/features/course/components/create-course-dialog"
import { Pagination } from "@/components/pagination"

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page ?? "1")
  const { courses, totalPages } = await getMyCourses({ page })

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creator Studio</h1>
          <p className="text-muted mt-1 text-sm">
            Create and manage your courses.
          </p>
        </div>
        <CreateCourseDialog />
      </div>
      <CourseList courses={courses} />
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
