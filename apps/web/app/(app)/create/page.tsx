import { notFound } from "next/navigation"
import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCourse } from "@/features/course/actions/courses"
import { UnitList } from "@/features/course/components/unit-list"
import { CreatorSidebar } from "@/features/course/components/creator-sidebar"
import { PublishButton } from "@/features/publish/components/publish-button"
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

  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  return (
    <div className="flex min-h-screen bg-background">
      <CreatorSidebar
        courseId={courseId}
        courseTitle={course.title}
      />

      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Course Builder
              </p>
              <h1 className="text-lg font-semibold">{course.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <PublishButton courseId={courseId} isPublished={course.isPublished} />
              <Link href={`/create/${courseId}/settings`}><Button variant="outline" size="sm">
                <HugeiconsIcon icon={Settings02Icon} size={16} />
              </Button></Link>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            {/* Units overview */}
            <div className="rounded-2xl border border-border p-6">
              <h2 className="text-lg font-semibold">Units overview</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Jump into a unit to map out lessons and content.
              </p>

              <div className="mt-6">
                <UnitList courseId={courseId} units={course.units} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
