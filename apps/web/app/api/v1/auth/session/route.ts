import { NextRequest } from "next/server"
import { json, error, getSession } from "../../helpers"

export async function GET(req: NextRequest) {
  const session = await getSession(req)
  if (!session) return error("Not authenticated", 401)

  return json({
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
      role: session.user.role,
    },
  })
}
