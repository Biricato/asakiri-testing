import { notFound } from "next/navigation"
import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCourse } from "@/features/course/actions/courses"
import { getExerciseGroup } from "@/features/exercise/actions/groups"
import { getItems } from "@/features/exercise/actions/items"
import { ItemEditor } from "@/features/exercise/components/item-editor"
import { CreatorSidebar } from "@/features/course/components/creator-sidebar"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function ExerciseGroupPage({
  params,
}: {
  params: Promise<{ courseId: string; groupId: string }>
}) {
  const { courseId, groupId } = await params
  const group = await getExerciseGroup(groupId)

  if (!group || group.courseId !== courseId) notFound()

  const [course, items, session] = await Promise.all([
    getCourse(courseId),
    getItems(groupId),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])

  return (
    <div className="flex min-h-screen bg-background">
      <CreatorSidebar
        courseId={courseId}
        courseTitle={course?.title}
        userName={session?.user.name ?? "User"}
      />

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon-sm"
                render={<Link href={`/create/${courseId}`} />}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
              </Button>
              <div>
                <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  Exercise Group
                </p>
                <h1 className="text-lg font-semibold">{group.title}</h1>
              </div>
            </div>
            <Button size="sm" render={<Link href={`/create/${courseId}`} />}>
              Back to units
            </Button>
          </div>
        </header>

        <main className="flex-1 p-6">
          <div className="mx-auto max-w-3xl">
            {group.description && (
              <p className="text-muted-foreground mb-4">{group.description}</p>
            )}
            <p className="text-muted-foreground mb-6 text-sm">
              Dataset type: {group.datasetType}
            </p>

            <h2 className="mb-4 text-lg font-semibold">Items</h2>
            <ItemEditor groupId={groupId} items={items} />
          </div>
        </main>
      </div>
    </div>
  )
}
