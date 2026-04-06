import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import { exerciseAttempt } from "@/schema/learning"
import { json, error, requireSession } from "../../../helpers"

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req)
    const { variantId, isCorrect, durationMs, answer } = await req.json()

    await db.insert(exerciseAttempt).values({
      userId: session.user.id,
      variantId,
      isCorrect,
      durationMs,
      answer,
    })

    return json({ success: true })
  } catch {
    return error("Unauthorized", 401)
  }
}
