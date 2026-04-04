import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCourse } from "@/features/course/actions/courses"
import { CourseSettings } from "@/features/course/components/course-settings"
import { CreatorSidebar } from "@/features/course/components/creator-sidebar"
import { Button } from "@workspace/ui/components/button"

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const [course, session] = await Promise.all([
    getCourse(courseId),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])

  if (!course) notFound()

  return (
    <div className="flex min-h-screen bg-background">
      <CreatorSidebar
        courseId={courseId}
        courseTitle={course.title}
        userName={session?.user.name ?? "User"}
      />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Course Details
              </p>
              <h1 className="text-lg font-semibold">{course.title}</h1>
            </div>
            <Button size="sm">Publish</Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-2xl">
            <CourseSettings course={course} />
          </div>
        </main>
      </div>
    </div>
  )
}
