import { NextRequest } from "next/server"
import { buyStreakFreeze } from "@/lib/gamification"
import { json, error, requireSession } from "../../helpers"

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const result = await buyStreakFreeze(session.user.id)

    if (!result.success) {
      return error(result.error ?? "Failed", 400)
    }

    return json({ success: true })
  } catch {
    return error("Unauthorized", 401)
  }
}
