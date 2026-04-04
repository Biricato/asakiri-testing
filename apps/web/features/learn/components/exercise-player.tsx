"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { submitAndUpdateSrs } from "../actions/srs"
import { submitExerciseAttempt } from "../actions/progress"

type Variant = {
  variantId: string
  type: string
  prompt: unknown
  solution: unknown
}

export function ExercisePlayer({
  variants,
  useSrs = false,
}: {
  variants: Variant[]
  useSrs?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState("")
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation?: string } | null>(null)
  const [results, setResults] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 })
  const startTime = useRef(Date.now())

  if (variants.length === 0) {
    return <p className="text-muted-foreground">No exercises available.</p>
  }

  if (currentIndex >= variants.length) {
    const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Complete</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Score: {results.correct}/{results.total} ({accuracy}%)</p>
          <Button onClick={() => { setCurrentIndex(0); setResults({ correct: 0, total: 0 }) }}>
            Restart
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="ml-2">
            Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const variant = variants[currentIndex]!
  const prompt = variant.prompt as Record<string, unknown>
  const solution = variant.solution as Record<string, unknown>
  const progress = ((currentIndex) / variants.length) * 100

  function checkAnswer() {
    const durationMs = Date.now() - startTime.current
    let isCorrect = false

    if (variant.type === "word_cloze") {
      const correct = (solution.correctAnswer as string)?.toLowerCase() ?? ""
      const alternatives = (solution.acceptedAlternatives as string[]) ?? []
      const userAnswer = answer.trim().toLowerCase()
      isCorrect = userAnswer === correct || alternatives.map(a => a.toLowerCase()).includes(userAnswer)
    } else if (variant.type === "mcq") {
      isCorrect = answer === (solution.correctOptionId as string)
    } else if (variant.type === "sentence_builder") {
      const target = (solution.targetTokens as string[]) ?? []
      isCorrect = answer === target.join(",")
    } else {
      isCorrect = answer.trim().length > 0
    }

    setFeedback({
      correct: isCorrect,
      explanation: solution.explanation as string | undefined,
    })
    setResults((r) => ({
      correct: r.correct + (isCorrect ? 1 : 0),
      total: r.total + 1,
    }))

    startTransition(async () => {
      const submitData = {
        variantId: variant.variantId,
        isCorrect,
        durationMs,
        answer,
      }
      if (useSrs) {
        await submitAndUpdateSrs(submitData)
      } else {
        await submitExerciseAttempt(submitData)
      }
    })
  }

  function next() {
    setCurrentIndex((i) => i + 1)
    setAnswer("")
    setFeedback(null)
    startTime.current = Date.now()
  }

  return (
    <div className="space-y-4">
      <Progress value={progress} className="h-2" />
      <p className="text-muted-foreground text-sm">
        {currentIndex + 1} / {variants.length}
      </p>

      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit text-xs">
            {variant.type}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {variant.type === "word_cloze" && (
            <div className="space-y-3">
              <p className="text-lg">{prompt.clozeText as string}</p>
              {typeof prompt.hint === "string" && prompt.hint && (
                <p className="text-muted-foreground text-sm">Hint: {prompt.hint}</p>
              )}
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !feedback && checkAnswer()}
                placeholder="Type your answer..."
                disabled={!!feedback}
              />
            </div>
          )}

          {variant.type === "mcq" && (
            <div className="space-y-3">
              <p className="text-lg">{prompt.stem as string}</p>
              {/* MCQ options would come from the variant's options field */}
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type answer..."
                disabled={!!feedback}
              />
            </div>
          )}

          {variant.type === "sentence_builder" && (
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">{prompt.helperText as string}</p>
              <div className="flex flex-wrap gap-2">
                {((prompt.sourceTokens as string[]) ?? []).map((token, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tokens = answer ? answer.split(",") : []
                      tokens.push(token)
                      setAnswer(tokens.join(","))
                    }}
                    disabled={!!feedback}
                  >
                    {token}
                  </Button>
                ))}
              </div>
              <p className="text-sm">
                Your order: {answer.split(",").filter(Boolean).join(" → ")}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAnswer("")}
                disabled={!!feedback}
              >
                Clear
              </Button>
            </div>
          )}

          {variant.type === "multi_blank" && (
            <div className="space-y-3">
              <p className="text-lg">{prompt.template as string}</p>
              <Input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Fill in the blanks..."
                disabled={!!feedback}
              />
            </div>
          )}

          {feedback ? (
            <div className="space-y-2">
              <Badge variant={feedback.correct ? "default" : "destructive"}>
                {feedback.correct ? "Correct!" : "Incorrect"}
              </Badge>
              {feedback.explanation && (
                <p className="text-muted-foreground text-sm">{feedback.explanation}</p>
              )}
              <Button onClick={next}>
                {currentIndex < variants.length - 1 ? "Next" : "Finish"}
              </Button>
            </div>
          ) : (
            <Button onClick={checkAnswer} disabled={!answer || pending}>
              Check
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
