import type {
  exerciseGroup,
  exerciseItem,
  exerciseVariant,
  exerciseOption,
} from "@/schema/exercise"

export type ExerciseGroup = typeof exerciseGroup.$inferSelect
export type ExerciseItem = typeof exerciseItem.$inferSelect
export type ExerciseVariant = typeof exerciseVariant.$inferSelect
export type ExerciseOption = typeof exerciseOption.$inferSelect

export type VariantType = "word_cloze" | "mcq" | "multi_blank" | "sentence_builder"

export type ItemWithVariants = ExerciseItem & {
  variants: (ExerciseVariant & { options: ExerciseOption[] })[]
}

export type GroupWithItems = ExerciseGroup & {
  items: ItemWithVariants[]
}

// Prompt/solution shapes per variant type
export type WordClozePrompt = {
  clozeText: string
  hint?: string
  translation?: string
  audioUrl?: string
  imageUrl?: string
}
export type WordClozeSolution = {
  correctAnswer: string
  acceptedAlternatives?: string[]
  explanation?: string
}

export type McqPrompt = {
  stem: string
  instructions?: string
  audioUrl?: string
  imageUrl?: string
}
export type McqSolution = {
  explanation?: string
  correctOptionId: string
}

export type MultiBlankPrompt = {
  template: string
  instructions?: string
}
export type MultiBlankSolution = {
  blanks: { key: string; correctAnswer: string; choices: string[] }[]
}

export type SentenceBuilderPrompt = {
  sourceTokens: string[]
  helperText?: string
}
export type SentenceBuilderSolution = {
  targetTokens: string[]
  distractorTokens?: string[]
  notes?: string
}
