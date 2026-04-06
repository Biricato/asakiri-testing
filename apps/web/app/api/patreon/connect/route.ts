import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPatreonOAuthUrl } from "@/lib/patreon"

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const role = req.nextUrl.searchParams.get("role") as "creator" | "learner" ?? "learner"
  const returnTo = req.nextUrl.searchParams.get("returnTo") ?? "/"

  // State encodes role + userId + returnTo
  const state = Buffer.from(
    JSON.stringify({ role, userId: session.user.id, returnTo }),
  ).toString("base64url")

  const url = getPatreonOAuthUrl(role, state)
  return NextResponse.redirect(url)
}
