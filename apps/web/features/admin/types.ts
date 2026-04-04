export type SiteSettings = {
  registration_mode: "open" | "invite_only"
  course_creation: "open" | "approved" | "admin_only"
  default_role: "learner" | "creator"
}

export const defaultSettings: SiteSettings = {
  registration_mode: "open",
  course_creation: "open",
  default_role: "learner",
}

export type InviteStatus = "pending" | "used" | "expired"

export type InviteWithStatus = {
  id: string
  email: string
  role: string
  code: string
  status: InviteStatus
  usedAt: Date | null
  expiresAt: Date
  createdAt: Date
}

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}
