import type { Metadata } from "next"
import { getCatalog } from "@/features/publish/actions/catalog"
import { CatalogGrid } from "@/features/publish/components/catalog-grid"

export const metadata: Metadata = {
  title: "Courses",
  description: "Browse and enroll in language courses. Find courses for any language, taught by expert teachers with interactive exercises and spaced repetition.",
  openGraph: {
    title: "Courses — Asakiri",
    description: "Browse and enroll in language courses. Find courses for any language, taught by expert teachers.",
  },
}

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
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Courses</h1>
      <p className="text-muted mt-1 text-sm">
        Browse and enroll in language courses.
      </p>
      <div className="mt-6">
        <CatalogGrid courses={courses} />
      </div>
    </div>
  )
}
