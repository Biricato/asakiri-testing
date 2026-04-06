import { Button, Card } from "@heroui/react"

type Props = {
  tierTitle: string
  tierAmountCents: number
  isConnected: boolean
  courseId: string
  lessonId: string
}

export function PatreonGate({
  tierTitle,
  tierAmountCents,
  isConnected,
  courseId,
  lessonId,
}: Props) {
  const returnTo = `/learn/${courseId}/lesson/${lessonId}`

  return (
    <Card className="text-center">
      <Card.Header>
        <Card.Title>Patreon supporters only</Card.Title>
        <Card.Description>
          This lesson requires the <strong>{tierTitle}</strong> tier
          {tierAmountCents > 0 && ` ($${(tierAmountCents / 100).toFixed(0)}/mo)`} on Patreon.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Connect your Patreon account to verify your membership.
            </p>
            <a href={`/api/patreon/connect?role=learner&returnTo=${encodeURIComponent(returnTo)}`}>
              <Button>Connect Patreon</Button>
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Your current Patreon tier doesn&apos;t include access to this lesson.
              Upgrade your pledge to unlock it.
            </p>
            <a href={`/api/patreon/connect?role=learner&returnTo=${encodeURIComponent(returnTo)}`}>
              <Button variant="outline" size="sm">Re-check membership</Button>
            </a>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
