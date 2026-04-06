import { NextRequest } from "next/server"
import { json } from "../helpers"
import { getCatalog } from "@/features/publish/actions/catalog"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const courses = await getCatalog({
    search: searchParams.get("search") ?? "",
    difficulty: searchParams.get("difficulty") ?? "",
    language: searchParams.get("language") ?? "",
  })

  return json({ courses })
}
