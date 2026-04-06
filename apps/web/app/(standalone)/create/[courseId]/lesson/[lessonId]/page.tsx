import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { lesson } from "@/schema/course"
import { getSections } from "@/features/course/actions/sections"
import { getCoursePatreonLink, getCourseTiers, getLessonTier } from "@/features/course/actions/patreon"
import { SectionEditor } from "@/features/course/components/section-editor"
import { PatreonTierCard } from "@/features/course/components/patreon-tier-card"
import { PageHeader } from "@/components/page-header"

export default async function LessonEditorPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>
}) {
  const { courseId, lessonId } = await params
  const rows = await db.select().from(lesson).where(eq(lesson.id, lessonId)).limit(1)
  const l = rows[0]
  if (!l || l.courseId !== courseId) notFound()

  const [sections, patreonLink] = await Promise.all([
    getSections(lessonId),
    getCoursePatreonLink(courseId).catch(() => null),
  ])

  let patreonTiers: { id: string; title: string; amountCents: number }[] = []
  let currentTier: { tierId: string } | null = null
  if (patreonLink) {
    ;[patreonTiers, currentTier] = await Promise.all([
      getCourseTiers(courseId),
      getLessonTier(lessonId),
    ])
  }

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/create/${courseId}`} label="Lesson Editor" title={l.title} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <SectionEditor lessonId={lessonId} lessonTitle={l.title} sections={sections} />
          {patreonLink && patreonTiers.length > 0 && (
            <PatreonTierCard
              type="lesson"
              id={lessonId}
              tiers={patreonTiers}
              currentTierId={currentTier?.tierId ?? null}
            />
          )}
        </div>
      </main>
    </div>
  )
}
