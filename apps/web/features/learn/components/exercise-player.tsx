"use client"

import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
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
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium">No exercises available.</p>
        <p className="text-muted-foreground mt-1 text-sm">Check back later.</p>
      </div>
    )
  }

  // Session complete
  if (currentIndex >= variants.length) {
    const accuracy = results.total > 0 ? Math.round((results.correct / results.total) * 100) : 0
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border p-8 text-center">
          <h2 className="text-2xl font-semibold">Session Complete</h2>
          <p className="text-muted-foreground mt-2">
            You scored {results.correct} out of {results.total} ({accuracy}%)
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setCurrentIndex(0); setResults({ correct: 0, total: 0 }) }}>
              Restart
            </Button>
            <Button onClick={() => router.back()}>
              Done
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const variant = variants[currentIndex]!
  const prompt = variant.prompt as Record<string, unknown>
  const solution = variant.solution as Record<string, unknown>
  const progress = ((currentIndex) / variants.length) * 100
  const remaining = variants.length - currentIndex - 1

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

  function skip() {
    next()
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Main content */}
      <div className="flex flex-1 justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {/* Exercise card */}
          <div className="rounded-3xl border p-6">
            {/* Progress header */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Exercise {currentIndex + 1} of {variants.length}
              </p>
              <p className="text-sm text-muted-foreground">
                {remaining} left
              </p>
            </div>
            <Progress value={progress} className="mb-6 h-2" />

            {/* Prompt */}
            <div className="rounded-2xl border p-5">
              {variant.type === "word_cloze" && (
                <>
                  <p className="text-muted-foreground text-sm">Fill in the missing word.</p>
                  <p className="mt-2 text-lg font-medium">
                    {String(prompt.clozeText ?? "")}
                  </p>
                </>
              )}

              {variant.type === "mcq" && (
                <>
                  <p className="text-muted-foreground text-sm">Choose the correct answer.</p>
                  <p className="mt-2 text-lg font-medium">
                    {String(prompt.stem ?? "")}
                  </p>
                </>
              )}

              {variant.type === "sentence_builder" && (
                <>
                  <p className="text-muted-foreground text-sm">
                    {String(prompt.helperText ?? "Arrange the words in the correct order.")}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
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
                  {answer && (
                    <div className="mt-3">
                      <p className="text-sm">
                        {answer.split(",").filter(Boolean).join(" ")}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-1"
                        onClick={() => setAnswer("")}
                        disabled={!!feedback}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </>
              )}

              {variant.type === "multi_blank" && (
                <>
                  <p className="text-muted-foreground text-sm">Fill in the blanks.</p>
                  <p className="mt-2 text-lg font-medium">
                    {String(prompt.template ?? "")}
                  </p>
                </>
              )}
            </div>

            {/* Answer input (for text-based variants) */}
            {variant.type !== "sentence_builder" && (
              <div className="mt-6">
                <p className="mb-2 text-sm font-medium">Your answer</p>
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !feedback && answer && checkAnswer()}
                  placeholder="Type the missing word"
                  disabled={!!feedback}
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div className={`mt-4 rounded-xl p-4 ${feedback.correct ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"}`}>
                <p className="font-medium">
                  {feedback.correct ? "Correct!" : "Incorrect"}
                </p>
                {!feedback.correct && typeof solution.correctAnswer === "string" && (
                  <p className="mt-1 text-sm">
                    The answer was: <strong>{solution.correctAnswer}</strong>
                  </p>
                )}
                {feedback.explanation && (
                  <p className="mt-1 text-sm">{feedback.explanation}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed bottom bar */}
      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          {feedback ? (
            <>
              <div />
              <Button onClick={next}>
                {currentIndex < variants.length - 1 ? "Continue" : "Finish"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={skip}>
                Skip
              </Button>
              <Button onClick={checkAnswer} disabled={!answer || pending}>
                Submit
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
