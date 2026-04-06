import { NextRequest } from "next/server"
import { seedAchievements } from "@/lib/seed-achievements"
import { json, error, requireSession } from "../../helpers"

export async function POST(req: NextRequest) {
  try {
    const session = await requireSession(req)
    if (session.user.role !== "admin") return error("Admin only", 403)

    await seedAchievements()
    return json({ success: true })
  } catch {
    return error("Unauthorized", 401)
  }
}
