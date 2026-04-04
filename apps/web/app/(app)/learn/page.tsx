import Link from "next/link"
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

  const [result, stats] = await Promise.all([
    getEnrolledCourses({ page }),
    getStats(),
  ])

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learn</h1>
          <p className="text-muted mt-1 text-sm">
            Your enrolled courses and progress.
          </p>
        </div>
        <Link href="/learn/stats">
          <Button variant="outline" size="sm">Stats</Button>
        </Link>
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
