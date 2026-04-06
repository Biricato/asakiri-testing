import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { patreonConnection, patreonLearner } from "@/schema/patreon"

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers }).catch(() => null)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { role } = await req.json()

  if (role === "creator") {
    await db.delete(patreonConnection).where(eq(patreonConnection.userId, session.user.id))
  } else {
    await db.delete(patreonLearner).where(eq(patreonLearner.userId, session.user.id))
  }

  return NextResponse.json({ success: true })
}
