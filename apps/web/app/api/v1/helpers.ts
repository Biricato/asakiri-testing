import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export async function getSession(req: NextRequest) {
  return auth.api.getSession({ headers: req.headers }).catch(() => null)
}

export async function requireSession(req: NextRequest) {
  const session = await getSession(req)
  if (!session) throw new Error("Unauthorized")
  return session
}
