export type EnrolledCourse = {
  enrollmentId: string
  publishedCourseId: string
  courseId: string
  title: string
  targetLanguage: string
  sourceLanguage: string
  difficulty: string
  coverImageUrl: string | null
  enrolledAt: Date
}

export type LearningNode = {
  id: string
  type: string
  lessonId: string | null
  exerciseGroupId: string | null
  order: number
  title: string
  completed: boolean
}

export type LearningUnit = {
  id: string
  title: string
  order: number
  nodes: LearningNode[]
}

export type SrsState = {
  dueAt: Date
  intervalDays: number
  easiness: number
  repetition: number
}
