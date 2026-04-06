export type SiteSettings = {
  registration_mode: "open" | "invite_only"
  course_creation: "open" | "approved" | "admin_only"
  default_role: "learner" | "creator"
  site_name: string
  site_tagline: string
  hero_title: string
  hero_description: string
  github_url: string
  discord_url: string
  show_github_button: "true" | "false"
  show_deploy_button: "true" | "false"
}

export const defaultSettings: SiteSettings = {
  registration_mode: "open",
  course_creation: "open",
  default_role: "learner",
  site_name: "Asakiri",
  site_tagline: "Language Learning Platform",
  hero_title: "Master languages through interactive courses built by expert teachers",
  hero_description: "Create engaging courses and learn through interactive exercises with spaced repetition. Learn at your own pace, track your progress, and master vocabulary naturally.",
  github_url: "https://github.com/AsakiriLingo/asakiri",
  discord_url: "",
  show_github_button: "true",
  show_deploy_button: "true",
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
