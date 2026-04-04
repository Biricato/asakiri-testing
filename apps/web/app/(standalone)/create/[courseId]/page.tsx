import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourse } from "@/features/course/actions/courses"
import { UnitList } from "@/features/course/components/unit-list"
import { PublishButton } from "@/features/publish/components/publish-button"
import { PageHeader } from "@/components/page-header"
import { Button } from "@heroui/react"
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
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref="/create" label="Course Builder" title={course.title}>
        <PublishButton courseId={courseId} isPublished={course.isPublished} />
        <Link href={`/create/${courseId}/settings`}><Button variant="outline" size="sm">
          <HugeiconsIcon icon={Settings02Icon} size={16} />
        </Button></Link>
      </PageHeader>
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl">
          <UnitList courseId={courseId} units={course.units} />
        </div>
      </main>
    </div>
  )
}
