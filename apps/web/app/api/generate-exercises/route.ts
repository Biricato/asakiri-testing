import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "AI generation not configured. Set GEMINI_API_KEY." },
      { status: 501 },
    )
  }

  const session = await auth.api
    .getSession({ headers: req.headers })
    .catch(() => null)

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json()
  const { content, targetLanguage, sourceLanguage, variantTypes, count = 5 } = body as {
    content: string
    targetLanguage: string
    sourceLanguage: string
    variantTypes: string[]
    count?: number
  }

  if (!content || !targetLanguage || !sourceLanguage) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const prompt = `You are a language learning exercise generator. Given lesson content, create ${count} exercise items for learning ${targetLanguage} from ${sourceLanguage}.

For each item, generate a word/phrase pair and one or more variants of these types: ${variantTypes.join(", ")}.

Lesson content:
${content}

Respond with valid JSON array:
[
  {
    "word": "target language word",
    "meaning": "source language meaning",
    "partOfSpeech": "noun/verb/adj/etc",
    "exampleSentence": "example in target language",
    "variants": [
      {
        "type": "word_cloze",
        "prompt": { "clozeText": "sentence with ___ blank", "hint": "hint", "translation": "translation" },
        "solution": { "correctAnswer": "answer", "acceptedAlternatives": [], "explanation": "why" }
      }
    ]
  }
]

Only return the JSON array, no other text.`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      }),
    },
  )

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json(
      { error: "Gemini API error", details: err },
      { status: 502 },
    )
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    return NextResponse.json({ error: "No response from AI" }, { status: 502 })
  }

  try {
    const items = JSON.parse(text)
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json(
      { error: "Failed to parse AI response", raw: text },
      { status: 502 },
    )
  }
}
