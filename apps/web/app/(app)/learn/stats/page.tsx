import Link from "next/link"
import { getStats } from "@/features/learn/actions/progress"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export default async function StatsPage() {
  const stats = await getStats()

  return (
    <div className="p-6">
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        render={<Link href="/learn" />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back
      </Button>

      <h1 className="text-2xl font-bold">Statistics</h1>
      <p className="text-muted-foreground mt-2">Your learning progress.</p>

      {stats ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-normal">
                Lessons completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.lessonsCompleted}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-normal">
                Exercises attempted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.totalAttempts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-normal">
                Accuracy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.accuracy}%</p>
              <p className="text-muted-foreground text-xs">
                {stats.correctAttempts} correct of {stats.totalAttempts}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-sm font-normal">
                Due for review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.dueReviews}</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-muted-foreground mt-6">Sign in to see your stats.</p>
      )}
    </div>
  )
}
