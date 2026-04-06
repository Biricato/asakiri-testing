import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCourse } from "@/features/course/actions/courses"
import {
  getCreatorPatreonStatus,
  getCoursePatreonLink,
  getCourseTiers,
} from "@/features/course/actions/patreon"
import { getCourseRole } from "@/features/course/actions/permissions"
import { getCollaborators } from "@/features/course/actions/collaborators"
import { CourseSettings } from "@/features/course/components/course-settings"
import { CollaboratorSettings } from "@/features/course/components/collaborator-settings"
import { PatreonSettings } from "@/features/course/components/patreon-settings"
import { PageHeader } from "@/components/page-header"

export default async function CourseSettingsPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
  const course = await getCourse(courseId)
  if (!course) notFound()

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)
  if (!session) notFound()

  const [myRole, collaborators] = await Promise.all([
    getCourseRole(courseId, session.user.id),
    getCollaborators(courseId),
  ])
  const isOwner = myRole === "owner" || session.user.role === "admin"

  const patreonConfigured = !!(process.env.PATREON_CLIENT_ID && process.env.PATREON_CLIENT_SECRET)

  let patreonStatus = null
  let coursePatreonLink = null
  let tiers: { id: string; title: string; amountCents: number }[] = []

  if (patreonConfigured && session) {
    ;[patreonStatus, coursePatreonLink, tiers] = await Promise.all([
      getCreatorPatreonStatus(session.user.id),
      getCoursePatreonLink(courseId),
      getCourseTiers(courseId),
    ])
  }

  return (
    <div className="flex min-h-svh flex-col">
      <PageHeader backHref={`/create/${courseId}`} label="Course Details" title={course.title} />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <CourseSettings course={course} />
          <CollaboratorSettings
            courseId={courseId}
            collaborators={collaborators}
            isOwner={isOwner}
          />
          <PatreonSettings
            courseId={courseId}
            patreonConfigured={patreonConfigured}
            isConnected={!!patreonStatus?.campaignId}
            isLinked={!!coursePatreonLink}
            tiers={tiers}
          />
        </div>
      </main>
    </div>
  )
}
