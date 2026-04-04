import { getCatalog } from "@/features/publish/actions/catalog"
import { CatalogGrid } from "@/features/publish/components/catalog-grid"

export default async function CourseCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const courses = await getCatalog({
    search: params.search ?? "",
    difficulty: params.difficulty ?? "",
    language: params.language ?? "",
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <p className="text-muted-foreground mt-2">
        Browse and enroll in language courses.
      </p>
      <div className="mt-6">
        <CatalogGrid courses={courses} />
      </div>
    </div>
  )
}
