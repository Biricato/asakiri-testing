// SM-2 spaced repetition algorithm — pure function
export function computeSm2Update(
  state: { intervalDays: number; easiness: number; repetition: number },
  isCorrect: boolean,
  durationMs: number,
): { intervalDays: number; easiness: number; repetition: number; dueAt: Date } {
  // Quality rating: 0-5 based on correctness and speed
  let quality: number
  if (!isCorrect) {
    quality = durationMs < 5000 ? 0 : 1
  } else {
    if (durationMs < 3000) quality = 5
    else if (durationMs < 8000) quality = 4
    else if (durationMs < 15000) quality = 3
    else quality = 2
  }

  let { easiness, repetition, intervalDays } = state

  // Update easiness factor
  easiness = Math.max(
    1.3,
    easiness + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  )

  if (quality < 3) {
    // Reset on failure
    repetition = 0
    intervalDays = 1
  } else {
    repetition += 1
    if (repetition === 1) {
      intervalDays = 1
    } else if (repetition === 2) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easiness)
    }
  }

  const dueAt = new Date()
  dueAt.setDate(dueAt.getDate() + intervalDays)

  return { intervalDays, easiness, repetition, dueAt }
}
