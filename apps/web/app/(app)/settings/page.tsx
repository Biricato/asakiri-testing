import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { patreonConnection, patreonLearner } from "@/schema/patreon"
import { Card, Button } from "@heroui/react"
import { PatreonDisconnectButton } from "./patreon-disconnect"

export default async function SettingsPage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)
  if (!session) redirect("/sign-in")

  const patreonEnabled = !!(process.env.PATREON_CLIENT_ID && process.env.PATREON_CLIENT_SECRET)

  const creatorConn = patreonEnabled
    ? await db
        .select()
        .from(patreonConnection)
        .where(eq(patreonConnection.userId, session.user.id))
        .limit(1)
        .catch(() => [])
    : []

  const learnerConn = patreonEnabled
    ? await db
        .select()
        .from(patreonLearner)
        .where(eq(patreonLearner.userId, session.user.id))
        .limit(1)
        .catch(() => [])
    : []

  const isCreator = ["admin", "creator"].includes(session.user.role ?? "")

  return (
    <div className="mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and connections.</p>
      </div>

      {/* Profile */}
      <Card>
        <Card.Header>
          <Card.Title>Profile</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-3">
          <div className="grid gap-1">
            <p className="text-muted-foreground text-xs">Name</p>
            <p className="text-sm font-medium">{session.user.name}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="text-sm font-medium">{session.user.email}</p>
          </div>
          <div className="grid gap-1">
            <p className="text-muted-foreground text-xs">Role</p>
            <p className="text-sm font-medium capitalize">{session.user.role ?? "learner"}</p>
          </div>
        </Card.Content>
      </Card>

      {/* Patreon */}
      {patreonEnabled && (
        <Card>
          <Card.Header>
            <Card.Title>Patreon</Card.Title>
            <Card.Description>
              {isCreator
                ? "Connect as a creator to gate lessons behind Patreon tiers, or as a learner to access gated content."
                : "Connect your Patreon to access tier-gated lessons from creators you support."}
            </Card.Description>
          </Card.Header>
          <Card.Content className="space-y-4">
            {/* Learner connection */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Learner account</p>
                <p className="text-muted-foreground text-xs">
                  {learnerConn[0] ? "Connected — your memberships are verified automatically" : "Connect to unlock Patreon-gated lessons"}
                </p>
              </div>
              {learnerConn[0] ? (
                <PatreonDisconnectButton role="learner" />
              ) : (
                <a href="/api/patreon/connect?role=learner&returnTo=/settings">
                  <Button variant="outline" size="sm">Connect</Button>
                </a>
              )}
            </div>

            {/* Creator connection */}
            {isCreator && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm font-medium">Creator account</p>
                  <p className="text-muted-foreground text-xs">
                    {creatorConn[0]
                      ? `Connected — campaign ${creatorConn[0].campaignId ? "linked" : "not found"}`
                      : "Connect to enable tier gating on your courses"}
                  </p>
                </div>
                {creatorConn[0] ? (
                  <PatreonDisconnectButton role="creator" />
                ) : (
                  <a href="/api/patreon/connect?role=creator&returnTo=/settings">
                    <Button variant="outline" size="sm">Connect</Button>
                  </a>
                )}
              </div>
            )}
          </Card.Content>
        </Card>
      )}
    </div>
  )
}
