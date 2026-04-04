import Link from "next/link"
import { getEnrolledCourses } from "@/features/learn/actions/enrolled"
import { getStats } from "@/features/learn/actions/progress"
import { EnrolledCourses } from "@/features/learn/components/enrolled-courses"
import { Button, Card } from "@heroui/react"

export default async function LearnPage() {
  const [courses, stats] = await Promise.all([
    getEnrolledCourses(),
    getStats(),
  ])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learn</h1>
          <p className="text-muted-foreground mt-2">
            Your enrolled courses and progress.
          </p>
        </div>
        <Link href="/learn/stats">
          <Button variant="outline">Stats</Button>
        </Link>
      </div>

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Lessons
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-2xl font-bold">{stats.lessonsCompleted}</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Exercises
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-2xl font-bold">{stats.totalAttempts}</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Accuracy
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-2xl font-bold">{stats.accuracy}%</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Due reviews
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-2xl font-bold">{stats.dueReviews}</p>
            </Card.Content>
          </Card>
        </div>
      )}

      <EnrolledCourses courses={courses} />
    </div>
  )
}
