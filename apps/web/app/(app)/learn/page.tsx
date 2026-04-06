import Link from "next/link"
import { headers } from "next/headers"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { userStats } from "@/schema/gamification"
import { HugeiconsIcon } from "@hugeicons/react"
import { FireIcon, StarIcon, Diamond01Icon } from "@hugeicons/core-free-icons"
import { getEnrolledCourses } from "@/features/learn/actions/enrolled"
import { getStats } from "@/features/learn/actions/progress"
import { EnrolledCourses } from "@/features/learn/components/enrolled-courses"
import { Pagination } from "@/components/pagination"
import { Button, Card } from "@heroui/react"

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page ?? "1")

  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null)

  const [result, stats, gamification] = await Promise.all([
    getEnrolledCourses({ page }),
    getStats(),
    session
      ? db.select().from(userStats).where(eq(userStats.userId, session.user.id)).limit(1).then((r) => r[0] ?? null)
      : null,
  ])

  const g = gamification ?? { xp: 0, level: 1, gems: 0, streakCount: 0 }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learn</h1>
          <p className="text-muted mt-1 text-sm">
            Your enrolled courses and progress.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5" title="Streak">
                <HugeiconsIcon icon={FireIcon} size={18} className={g.streakCount > 0 ? "text-danger" : "text-muted"} />
                <span className="text-sm font-bold">{g.streakCount}</span>
              </div>
              <div className="flex items-center gap-1.5" title="XP">
                <HugeiconsIcon icon={StarIcon} size={18} className="text-warning" />
                <span className="text-sm font-bold">{g.xp}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Gems">
                <HugeiconsIcon icon={Diamond01Icon} size={18} className="text-accent" />
                <span className="text-sm font-bold">{g.gems}</span>
              </div>
              <div className="bg-primary text-primary-foreground rounded-lg px-2.5 py-1 text-xs font-bold" title="Level">
                Lv.{g.level}
              </div>
            </div>
          )}
          <Link href="/learn/stats">
            <Button variant="outline" size="sm">Stats</Button>
          </Link>
        </div>
      </div>

      {stats && (
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          <Card>
            <Card.Header>
              <Card.Description>Lessons</Card.Description>
              <Card.Title className="text-2xl">{stats.lessonsCompleted}</Card.Title>
            </Card.Header>
          </Card>
          <Card>
            <Card.Header>
              <Card.Description>Exercises</Card.Description>
              <Card.Title className="text-2xl">{stats.totalAttempts}</Card.Title>
            </Card.Header>
          </Card>
          <Card>
            <Card.Header>
              <Card.Description>Accuracy</Card.Description>
              <Card.Title className="text-2xl">{stats.accuracy}%</Card.Title>
            </Card.Header>
          </Card>
          <Card>
            <Card.Header>
              <Card.Description>Due reviews</Card.Description>
              <Card.Title className="text-2xl">{stats.dueReviews}</Card.Title>
            </Card.Header>
          </Card>
        </div>
      )}

      <EnrolledCourses courses={result.courses} />
      <Pagination page={page} totalPages={result.totalPages} />
    </div>
  )
}
