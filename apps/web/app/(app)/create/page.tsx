import { getMyCourses } from "@/features/course/actions/courses"
import { CourseList } from "@/features/course/components/course-list"
import { CreateCourseDialog } from "@/features/course/components/create-course-dialog"

export default async function CreatePage() {
  const courses = await getMyCourses()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Creator Studio</h1>
          <p className="text-muted mt-2">
            Create and manage your courses.
          </p>
        </div>
        <CreateCourseDialog />
      </div>
      <CourseList courses={courses} />
    </div>
  )
}
