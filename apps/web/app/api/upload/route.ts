import { NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { auth } from "@/lib/auth"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"]
const AUDIO_TYPES = ["audio/mpeg", "audio/ogg", "audio/wav", "audio/mp4"]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  const session = await auth.api
    .getSession({ headers: req.headers })
    .catch(() => null)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const isImage = IMAGE_TYPES.includes(file.type)
  const isAudio = AUDIO_TYPES.includes(file.type)

  if (!isImage && !isAudio) {
    return NextResponse.json(
      { error: "Unsupported file type. Allowed: images (jpg, png, gif, webp) and audio (mp3, ogg, wav)." },
      { status: 400 },
    )
  }

  const maxSize = isImage ? MAX_IMAGE_SIZE : MAX_AUDIO_SIZE
  if (file.size > maxSize) {
    return NextResponse.json(
      { error: `File too large. Max: ${isImage ? "5MB" : "20MB"}.` },
      { status: 400 },
    )
  }

  const blob = await put(file.name, file, {
    access: "public",
  })

  return NextResponse.json({ url: blob.url })
}
