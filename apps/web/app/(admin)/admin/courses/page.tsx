import { getAdminCourses } from "@/features/admin/actions/courses"
import { CoursesTable } from "@/features/admin/components/courses-table"

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page ?? "1")
  const search = params.search ?? ""

  const result = await getAdminCourses({ page, search })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <p className="text-muted-foreground mt-2">
        Oversee all courses on the platform.
      </p>
      <div className="mt-6">
        <CoursesTable result={result} />
      </div>
    </div>
  )
}
