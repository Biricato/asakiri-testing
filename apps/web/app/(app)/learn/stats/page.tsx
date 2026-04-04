import Link from "next/link"
import { getStats } from "@/features/learn/actions/progress"
import { Card, Button } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function StatsPage() {
  const stats = await getStats()

  return (
    <div className="p-6">
      <Link href="/learn">
        <Button variant="ghost" size="sm" className="mb-4">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
          Back
        </Button>
      </Link>

      <h1 className="text-2xl font-bold">Statistics</h1>
      <p className="text-muted-foreground mt-2">Your learning progress.</p>

      {stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Lessons completed
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-3xl font-bold">{stats.lessonsCompleted}</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Exercises attempted
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-3xl font-bold">{stats.totalAttempts}</p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Accuracy
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-3xl font-bold">{stats.accuracy}%</p>
              <p className="text-muted-foreground text-xs">
                {stats.correctAttempts} correct of {stats.totalAttempts}
              </p>
            </Card.Content>
          </Card>
          <Card>
            <Card.Header className="pb-2">
              <Card.Title className="text-muted-foreground text-sm font-normal">
                Due for review
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <p className="text-3xl font-bold">{stats.dueReviews}</p>
            </Card.Content>
          </Card>
        </div>
      ) : (
        <p className="text-muted-foreground mt-6">Sign in to see your stats.</p>
      )}
    </div>
  )
}
