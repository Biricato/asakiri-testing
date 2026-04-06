import { eq } from "drizzle-orm"
import { db } from "./db"
import { patreonConnection, patreonLearner, type PatreonTier } from "@/schema/patreon"

const PATREON_API = "https://www.patreon.com/api/oauth2/v2"
const TOKEN_URL = "https://www.patreon.com/api/oauth2/token"

// ── Token refresh ──────────────────────────────────────────────────

async function refreshAccessToken(refreshToken: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.PATREON_CLIENT_ID!,
      client_secret: process.env.PATREON_CLIENT_SECRET!,
    }),
  })
  if (!res.ok) throw new Error("Failed to refresh Patreon token")
  return res.json()
}

async function getCreatorToken(userId: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(patreonConnection)
    .where(eq(patreonConnection.userId, userId))
    .limit(1)
  const conn = rows[0]
  if (!conn) return null

  // Refresh if expired (or will expire in 5 min)
  if (conn.tokenExpiresAt && conn.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
    const tokens = await refreshAccessToken(conn.refreshToken)
    await db
      .update(patreonConnection)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      })
      .where(eq(patreonConnection.userId, userId))
    return tokens.access_token
  }

  return conn.accessToken
}

async function getLearnerToken(userId: string): Promise<string | null> {
  const rows = await db
    .select()
    .from(patreonLearner)
    .where(eq(patreonLearner.userId, userId))
    .limit(1)
  const conn = rows[0]
  if (!conn) return null

  if (conn.tokenExpiresAt && conn.tokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
    const tokens = await refreshAccessToken(conn.refreshToken)
    await db
      .update(patreonLearner)
      .set({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      })
      .where(eq(patreonLearner.userId, userId))
    return tokens.access_token
  }

  return conn.accessToken
}

// ── Campaign tiers ─────────────────────────────────────────────────

export async function getCampaignTiers(userId: string): Promise<PatreonTier[]> {
  // Check cache first (valid for 1 hour)
  const rows = await db
    .select()
    .from(patreonConnection)
    .where(eq(patreonConnection.userId, userId))
    .limit(1)
  const conn = rows[0]
  if (!conn) return []

  if (
    conn.tiersCache &&
    conn.tiersCachedAt &&
    Date.now() - conn.tiersCachedAt.getTime() < 60 * 60 * 1000
  ) {
    return conn.tiersCache
  }

  const token = await getCreatorToken(userId)
  if (!token || !conn.campaignId) return []

  const res = await fetch(
    `${PATREON_API}/campaigns/${conn.campaignId}?include=tiers&fields%5Btier%5D=title,amount_cents`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) return conn.tiersCache ?? []

  const data = await res.json()
  const tiers: PatreonTier[] = (data.included ?? [])
    .filter((i: any) => i.type === "tier")
    .map((t: any) => ({
      id: t.id,
      title: t.attributes.title,
      amountCents: t.attributes.amount_cents,
    }))
    .sort((a: PatreonTier, b: PatreonTier) => a.amountCents - b.amountCents)

  // Update cache
  await db
    .update(patreonConnection)
    .set({ tiersCache: tiers, tiersCachedAt: new Date() })
    .where(eq(patreonConnection.userId, userId))

  return tiers
}

// ── Check learner membership ───────────────────────────────────────

export async function checkLearnerMembership(
  learnerUserId: string,
  campaignId: string,
): Promise<{ isMember: boolean; tierAmountCents: number }> {
  const token = await getLearnerToken(learnerUserId)
  if (!token) return { isMember: false, tierAmountCents: 0 }

  const res = await fetch(
    `${PATREON_API}/identity?include=memberships,memberships.campaign&fields%5Bmember%5D=currently_entitled_amount_cents,patron_status&fields%5Bcampaign%5D=`,
    { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 900 } },
  )
  if (!res.ok) return { isMember: false, tierAmountCents: 0 }

  const data = await res.json()
  const memberships = (data.included ?? []).filter((i: any) => i.type === "member")

  for (const m of memberships) {
    const memberCampaign = m.relationships?.campaign?.data?.id
    if (memberCampaign === campaignId && m.attributes?.patron_status === "active_patron") {
      return {
        isMember: true,
        tierAmountCents: m.attributes.currently_entitled_amount_cents ?? 0,
      }
    }
  }

  return { isMember: false, tierAmountCents: 0 }
}

// ── OAuth helpers ──────────────────────────────────────────────────

export function getPatreonOAuthUrl(role: "creator" | "learner", state: string): string {
  const scopes =
    role === "creator"
      ? "identity campaigns"
      : "identity"

  const redirectUri = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/patreon/callback`

  return `https://www.patreon.com/oauth2/authorize?${new URLSearchParams({
    response_type: "code",
    client_id: process.env.PATREON_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: scopes,
    state,
  })}`
}

export async function exchangePatreonCode(code: string): Promise<{
  access_token: string
  refresh_token: string
  expires_in: number
}> {
  const redirectUri = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/api/patreon/callback`
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: process.env.PATREON_CLIENT_ID!,
      client_secret: process.env.PATREON_CLIENT_SECRET!,
      redirect_uri: redirectUri,
    }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`Patreon token exchange failed (${res.status}): ${body}`)
  }
  return res.json()
}

export async function getPatreonIdentity(
  accessToken: string,
): Promise<{ userId: string; campaignId: string | null }> {
  // Get user ID
  const identityRes = await fetch(
    `${PATREON_API}/identity?fields%5Buser%5D=email,full_name`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!identityRes.ok) {
    const body = await identityRes.text().catch(() => "")
    throw new Error(`Patreon identity failed (${identityRes.status}): ${body}`)
  }

  const identityData = await identityRes.json()
  const userId = identityData.data.id

  // Try to get campaign ID (only works for creators with the campaigns scope)
  let campaignId: string | null = null
  try {
    const campaignsRes = await fetch(
      `${PATREON_API}/campaigns`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (campaignsRes.ok) {
      const campaignsData = await campaignsRes.json()
      campaignId = campaignsData.data?.[0]?.id ?? null
    }
  } catch {
    // Not a creator or no campaigns scope — that's fine
  }

  return { userId, campaignId }
}
