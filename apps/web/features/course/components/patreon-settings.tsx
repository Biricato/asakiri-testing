"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button, Card } from "@heroui/react"
import { linkCourseToPatreon, unlinkCourseFromPatreon } from "../actions/patreon"
import type { PatreonTier } from "@/schema/patreon"

type Props = {
  courseId: string
  patreonConfigured: boolean // PATREON_CLIENT_ID is set
  isConnected: boolean // creator has Patreon connected
  isLinked: boolean // course is linked to Patreon campaign
  tiers: PatreonTier[]
}

export function PatreonSettings({ courseId, patreonConfigured, isConnected, isLinked, tiers }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  function handleLink() {
    startTransition(async () => {
      await linkCourseToPatreon(courseId)
      toast.success("Patreon linked to course")
      router.refresh()
    })
  }

  function handleUnlink() {
    startTransition(async () => {
      await unlinkCourseFromPatreon(courseId)
      toast.success("Patreon unlinked — all tier requirements removed")
      router.refresh()
    })
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Patreon Integration</Card.Title>
        <Card.Description>
          Gate lessons behind Patreon tiers. Supporters get access based on their pledge level.
        </Card.Description>
      </Card.Header>
      <Card.Content className="space-y-4">
        {!patreonConfigured ? (
          <div>
            <p className="text-muted-foreground text-sm">
              Patreon integration requires <code className="text-xs bg-muted px-1 py-0.5 rounded">PATREON_CLIENT_ID</code> and <code className="text-xs bg-muted px-1 py-0.5 rounded">PATREON_CLIENT_SECRET</code> environment variables.
              Set them up in your hosting provider to enable tier-based lesson gating.
            </p>
          </div>
        ) : !isConnected ? (
          <div>
            <p className="text-muted-foreground text-sm mb-3">
              Connect your Patreon account to enable tier-based lesson gating.
            </p>
            <a href={`/api/patreon/connect?role=creator&returnTo=/create/${courseId}/settings`}>
              <Button variant="outline" size="sm">
                Connect Patreon
              </Button>
            </a>
          </div>
        ) : !isLinked ? (
          <div>
            <p className="text-muted-foreground text-sm mb-3">
              Link this course to your Patreon campaign to start gating lessons.
            </p>
            <Button onPress={handleLink} isDisabled={pending} variant="outline" size="sm">
              {pending ? "Linking..." : "Link to Patreon campaign"}
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm mb-3">
              Patreon is linked. You can assign tiers to individual lessons in the course editor.
            </p>
            {tiers.length > 0 && (
              <div className="mb-3">
                <p className="text-muted-foreground text-xs mb-1">Available tiers:</p>
                <div className="flex flex-wrap gap-1.5">
                  {tiers.map((t) => (
                    <span
                      key={t.id}
                      className="rounded-full border border-border px-2.5 py-0.5 text-xs"
                    >
                      {t.title} — ${(t.amountCents / 100).toFixed(0)}/mo
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Button onPress={handleUnlink} isDisabled={pending} variant="danger" size="sm">
              {pending ? "Unlinking..." : "Unlink Patreon"}
            </Button>
          </div>
        )}
      </Card.Content>
    </Card>
  )
}
