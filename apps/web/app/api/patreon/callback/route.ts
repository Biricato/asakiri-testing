import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { patreonConnection, patreonLearner } from "@/schema/patreon"
import { exchangePatreonCode, getPatreonIdentity } from "@/lib/patreon"

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  const stateParam = req.nextUrl.searchParams.get("state")

  if (!code || !stateParam) {
    return NextResponse.redirect(new URL("/?error=patreon_missing_params", req.url))
  }

  let state: { role: string; userId: string; returnTo: string }
  try {
    state = JSON.parse(Buffer.from(stateParam, "base64url").toString())
  } catch {
    return NextResponse.redirect(new URL("/?error=patreon_invalid_state", req.url))
  }

  try {
    const tokens = await exchangePatreonCode(code)
    const identity = await getPatreonIdentity(tokens.access_token)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    if (state.role === "creator") {
      // Upsert creator connection
      const existing = await db
        .select()
        .from(patreonConnection)
        .where(eq(patreonConnection.userId, state.userId))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(patreonConnection)
          .set({
            patreonUserId: identity.userId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiresAt: expiresAt,
            campaignId: identity.campaignId,
          })
          .where(eq(patreonConnection.userId, state.userId))
      } else {
        await db.insert(patreonConnection).values({
          userId: state.userId,
          patreonUserId: identity.userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: expiresAt,
          campaignId: identity.campaignId,
        })
      }
    } else {
      // Upsert learner connection
      const existing = await db
        .select()
        .from(patreonLearner)
        .where(eq(patreonLearner.userId, state.userId))
        .limit(1)

      if (existing.length > 0) {
        await db
          .update(patreonLearner)
          .set({
            patreonUserId: identity.userId,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiresAt: expiresAt,
          })
          .where(eq(patreonLearner.userId, state.userId))
      } else {
        await db.insert(patreonLearner).values({
          userId: state.userId,
          patreonUserId: identity.userId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt: expiresAt,
        })
      }
    }

    return NextResponse.redirect(new URL(state.returnTo, req.url))
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    console.error("Patreon OAuth error:", msg)
    return NextResponse.redirect(new URL(`/?error=patreon_oauth_failed&detail=${encodeURIComponent(msg)}`, req.url))
  }
}
