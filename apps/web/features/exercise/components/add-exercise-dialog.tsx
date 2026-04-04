"use client"

import { useState, useMemo } from "react"
import { Button, Input, Label, Modal, Select, ListBox, Checkbox } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"

type ExerciseType = "word_cloze" | "mcq" | "multi_blank" | "sentence_builder"

type SavePayload = {
  type: ExerciseType
  word: string
  meaning: string
  partOfSpeech: string
  exampleSentence: string
  prompt: Record<string, unknown>
  solution: Record<string, unknown>
  options?: { label: string; value: string; isCorrect: boolean }[]
}

export type InitialExerciseData = {
  type: ExerciseType
  word: string
  meaning: string
  partOfSpeech: string
  exampleSentence: string
  prompt: Record<string, unknown>
  solution: Record<string, unknown>
  options?: { id: string; label: string; isCorrect: boolean }[]
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  onSave,
  isSaving,
  mode = "create",
  initialData,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (payload: SavePayload) => Promise<void>
  isSaving: boolean
  mode?: "create" | "edit"
  initialData?: InitialExerciseData | null
}) {
  const init = initialData
  const [type, setType] = useState<ExerciseType | null>(init?.type ?? null)

  // Shared metadata
  const [word, setWord] = useState(init?.word ?? "")
  const [meaning, setMeaning] = useState(init?.meaning ?? "")
  const [partOfSpeech, setPartOfSpeech] = useState(init?.partOfSpeech ?? "")
  const [exampleSentence, setExampleSentence] = useState(init?.exampleSentence ?? "")

  // Word cloze
  const [clozeText, setClozeText] = useState(String(init?.prompt?.clozeText ?? ""))
  const [hint, setHint] = useState(String(init?.prompt?.hint ?? ""))
  const [correctAnswer, setCorrectAnswer] = useState(String(init?.solution?.correctAnswer ?? ""))
  const [alternatives, setAlternatives] = useState(
    Array.isArray(init?.solution?.acceptedAlternatives)
      ? (init.solution.acceptedAlternatives as string[]).join(", ")
      : ""
  )

  // MCQ
  const [stem, setStem] = useState(String(init?.prompt?.stem ?? ""))
  const [explanation, setExplanation] = useState(String(init?.solution?.explanation ?? ""))
  const [options, setOptions] = useState(
    init?.options?.length
      ? init.options.map((o) => ({ id: o.id, label: o.label, isCorrect: o.isCorrect }))
      : [{ id: "1", label: "", isCorrect: true }, { id: "2", label: "", isCorrect: false }]
  )

  // Multi blank
  const [template, setTemplate] = useState(String(init?.prompt?.template ?? ""))
  const [blanks, setBlanks] = useState(
    Array.isArray((init?.solution as Record<string, unknown>)?.blanks)
      ? ((init!.solution as { blanks: { key: string; correctAnswer: string; choices: string[] }[] }).blanks).map((b) => ({
          key: b.key,
          correctAnswer: b.correctAnswer,
          choices: b.choices.join(", "),
        }))
      : [{ key: "blank1", correctAnswer: "", choices: "" }]
  )

  // Sentence builder
  const [sourceTokens, setSourceTokens] = useState(
    Array.isArray(init?.prompt?.sourceTokens) ? (init.prompt.sourceTokens as string[]).join(", ") : ""
  )
  const [targetTokens, setTargetTokens] = useState(
    Array.isArray(init?.solution?.targetTokens) ? (init.solution.targetTokens as string[]).join(", ") : ""
  )
  const [distractorTokens, setDistractorTokens] = useState(
    Array.isArray(init?.solution?.distractorTokens) ? (init.solution.distractorTokens as string[]).join(", ") : ""
  )

  function reset() {
    setType(null)
    setWord(""); setMeaning(""); setPartOfSpeech(""); setExampleSentence("")
    setClozeText(""); setHint(""); setCorrectAnswer(""); setAlternatives("")
    setStem(""); setExplanation("")
    setOptions([{ id: "1", label: "", isCorrect: true }, { id: "2", label: "", isCorrect: false }])
    setTemplate("")
    setBlanks([{ key: "blank1", correctAnswer: "", choices: "" }])
    setSourceTokens(""); setTargetTokens(""); setDistractorTokens("")
  }

  const canSave = useMemo(() => {
    if (!type) return false
    switch (type) {
      case "word_cloze":
        return clozeText.trim().length > 0 && correctAnswer.trim().length > 0
      case "mcq": {
        const filled = options.filter((o) => o.label.trim().length > 0)
        return stem.trim().length > 0 && filled.length >= 2 && filled.some((o) => o.isCorrect)
      }
      case "multi_blank":
        return template.trim().length > 0 && blanks.every((b) => b.correctAnswer.trim().length > 0)
      case "sentence_builder":
        return sourceTokens.trim().length > 0 && targetTokens.trim().length > 0
    }
  }, [type, clozeText, correctAnswer, stem, options, template, blanks, sourceTokens, targetTokens])

  function split(s: string) {
    return s.split(",").map((v) => v.trim()).filter(Boolean)
  }

  async function handleSave() {
    if (!type || !canSave) return

    let prompt: Record<string, unknown> = {}
    let solution: Record<string, unknown> = {}
    let optionsList: SavePayload["options"] = undefined

    switch (type) {
      case "word_cloze":
        prompt = { clozeText, hint }
        solution = { correctAnswer, acceptedAlternatives: split(alternatives) }
        break
      case "mcq":
        prompt = { stem }
        solution = {
          explanation,
          correctOptionId: options.find((o) => o.isCorrect)?.id ?? "",
        }
        optionsList = options
          .filter((o) => o.label.trim())
          .map((o) => ({ label: o.label, value: o.label, isCorrect: o.isCorrect }))
        break
      case "multi_blank":
        prompt = { template }
        solution = {
          blanks: blanks.map((b) => ({
            key: b.key,
            correctAnswer: b.correctAnswer,
            choices: split(b.choices),
          })),
        }
        break
      case "sentence_builder":
        prompt = { sourceTokens: split(sourceTokens) }
        solution = {
          targetTokens: split(targetTokens),
          distractorTokens: split(distractorTokens),
        }
        break
    }

    await onSave({ type, word, meaning, partOfSpeech, exampleSentence, prompt, solution, options: optionsList })
    reset()
  }

  return (
    <Modal isOpen={open} onOpenChange={(isOpen) => { if (!isOpen) reset(); onOpenChange(isOpen) }}>
      <Modal.Backdrop><Modal.Container><Modal.Dialog className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <Modal.CloseTrigger />
        <Modal.Header><Modal.Heading>{mode === "edit" ? "Edit exercise" : "Add exercise"}</Modal.Heading></Modal.Header>
        <Modal.Body className="space-y-4">
          {/* Type selector */}
          <div className="grid gap-1.5">
            <Label>Exercise type</Label>
            <Select
              selectedKey={type ?? undefined}
              onSelectionChange={(key) => key && setType(key as ExerciseType)}
              aria-label="Exercise type"
              className="w-full"
              placeholder="Select a type..."
            >
              <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
              <Select.Popover>
                <ListBox>
                  <ListBox.Item id="word_cloze" textValue="Word Cloze">Word Cloze — fill in the blank</ListBox.Item>
                  <ListBox.Item id="mcq" textValue="Multiple Choice">Multiple Choice — pick the correct answer</ListBox.Item>
                  <ListBox.Item id="multi_blank" textValue="Multi Blank">Multi Blank — fill multiple blanks</ListBox.Item>
                  <ListBox.Item id="sentence_builder" textValue="Sentence Builder">Sentence Builder — arrange words</ListBox.Item>
                </ListBox>
              </Select.Popover>
            </Select>
          </div>

          {/* Shared metadata */}
          {type && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Word</Label>
                  <Input value={word} onChange={(e) => setWord(e.target.value)} placeholder="e.g. neko" className="w-full" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Meaning</Label>
                  <Input value={meaning} onChange={(e) => setMeaning(e.target.value)} placeholder="e.g. cat" className="w-full" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input value={partOfSpeech} onChange={(e) => setPartOfSpeech(e.target.value)} placeholder="Part of speech" className="w-full" />
                <Input value={exampleSentence} onChange={(e) => setExampleSentence(e.target.value)} placeholder="Example sentence" className="w-full" />
              </div>
            </>
          )}

          {/* Type-specific form */}
          {type === "word_cloze" && (
            <div className="space-y-3 border-t pt-3">
              <div className="grid gap-1.5">
                <Label>Cloze text (use ___ for blank)</Label>
                <Input value={clozeText} onChange={(e) => setClozeText(e.target.value)} placeholder="The ___ is sleeping" className="w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label>Correct answer</Label>
                  <Input value={correctAnswer} onChange={(e) => setCorrectAnswer(e.target.value)} placeholder="cat" className="w-full" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Hint</Label>
                  <Input value={hint} onChange={(e) => setHint(e.target.value)} placeholder="animal" className="w-full" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Accepted alternatives (comma-separated)</Label>
                <Input value={alternatives} onChange={(e) => setAlternatives(e.target.value)} placeholder="kitty, kitten" className="w-full" />
              </div>
            </div>
          )}

          {type === "mcq" && (
            <div className="space-y-3 border-t pt-3">
              <div className="grid gap-1.5">
                <Label>Question</Label>
                <Input value={stem} onChange={(e) => setStem(e.target.value)} placeholder="What does 'neko' mean?" className="w-full" />
              </div>
              <div className="grid gap-1.5">
                <Label>Options</Label>
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <Checkbox
                      isSelected={opt.isCorrect}
                      onChange={() => {
                        setOptions(options.map((o, j) => ({ ...o, isCorrect: j === i })))
                      }}
                    />
                    <Input
                      value={opt.label}
                      onChange={(e) => {
                        const updated = [...options]
                        updated[i] = { ...opt, label: e.target.value }
                        setOptions(updated)
                      }}
                      placeholder={`Option ${i + 1}`}
                      className="w-full"
                    />
                    {options.length > 2 && (
                      <Button variant="ghost" isIconOnly size="sm" onPress={() => setOptions(options.filter((_, j) => j !== i))}>
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                {options.length < 6 && (
                  <Button variant="ghost" size="sm" onPress={() => setOptions([...options, { id: String(options.length + 1), label: "", isCorrect: false }])}>
                    <HugeiconsIcon icon={Add01Icon} size={14} />
                    Add option
                  </Button>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label>Explanation (optional)</Label>
                <Input value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Why this is the correct answer" className="w-full" />
              </div>
            </div>
          )}

          {type === "multi_blank" && (
            <div className="space-y-3 border-t pt-3">
              <div className="grid gap-1.5">
                <Label>Template (use {"{blank1}"}, {"{blank2}"}, etc.)</Label>
                <Input value={template} onChange={(e) => setTemplate(e.target.value)} placeholder="I {blank1} to the {blank2}" className="w-full" />
              </div>
              <div className="grid gap-1.5">
                <Label>Blanks</Label>
                {blanks.map((blank, i) => (
                  <div key={blank.key} className="flex items-center gap-2">
                    <span className="text-muted text-xs w-14 shrink-0">{blank.key}</span>
                    <Input
                      value={blank.correctAnswer}
                      onChange={(e) => {
                        const updated = [...blanks]
                        updated[i] = { ...blank, correctAnswer: e.target.value }
                        setBlanks(updated)
                      }}
                      placeholder="Correct answer"
                      className="w-full"
                    />
                    <Input
                      value={blank.choices}
                      onChange={(e) => {
                        const updated = [...blanks]
                        updated[i] = { ...blank, choices: e.target.value }
                        setBlanks(updated)
                      }}
                      placeholder="Choices (comma-separated)"
                      className="w-full"
                    />
                    {blanks.length > 1 && (
                      <Button variant="ghost" isIconOnly size="sm" onPress={() => setBlanks(blanks.filter((_, j) => j !== i))}>
                        <HugeiconsIcon icon={Delete02Icon} size={14} />
                      </Button>
                    )}
                  </div>
                ))}
                {blanks.length < 5 && (
                  <Button variant="ghost" size="sm" onPress={() => setBlanks([...blanks, { key: `blank${blanks.length + 1}`, correctAnswer: "", choices: "" }])}>
                    <HugeiconsIcon icon={Add01Icon} size={14} />
                    Add blank
                  </Button>
                )}
              </div>
            </div>
          )}

          {type === "sentence_builder" && (
            <div className="space-y-3 border-t pt-3">
              <div className="grid gap-1.5">
                <Label>Source tokens (comma-separated)</Label>
                <Input value={sourceTokens} onChange={(e) => setSourceTokens(e.target.value)} placeholder="the, cat, sat, on, mat" className="w-full" />
              </div>
              <div className="grid gap-1.5">
                <Label>Target tokens (correct order, comma-separated)</Label>
                <Input value={targetTokens} onChange={(e) => setTargetTokens(e.target.value)} placeholder="the, cat, sat, on, the, mat" className="w-full" />
              </div>
              <div className="grid gap-1.5">
                <Label>Distractor tokens (comma-separated, optional)</Label>
                <Input value={distractorTokens} onChange={(e) => setDistractorTokens(e.target.value)} placeholder="dog, ran" className="w-full" />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="tertiary" slot="close">Cancel</Button>
          <Button onPress={handleSave} isDisabled={!canSave || isSaving}>
            {isSaving ? "Saving..." : mode === "edit" ? "Save changes" : "Add exercise"}
          </Button>
        </Modal.Footer>
      </Modal.Dialog></Modal.Container></Modal.Backdrop>
    </Modal>
  )
}
