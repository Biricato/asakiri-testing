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
  privacy_policy: string
  terms_of_service: string
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
  privacy_policy: `Last updated: April 6, 2026

1. Information We Collect
We collect information you provide when creating an account, including your name, email address, and password. We also collect usage data such as courses enrolled, lesson progress, and exercise results to personalize your learning experience.

2. How We Use Your Information
Your information is used to provide and improve the platform, track your learning progress, and communicate important updates. We do not sell your personal information to third parties.

3. Data Storage and Security
Your data is stored securely using industry-standard encryption. Passwords are hashed and never stored in plain text. We use secure connections (HTTPS) for all data transmission.

4. Cookies
We use essential cookies to maintain your session and preferences. No third-party tracking cookies are used.

5. Your Rights
You may request access to, correction of, or deletion of your personal data at any time by contacting the platform administrator. You may also delete your account, which will remove your personal data from our systems.

6. Data Retention
We retain your data for as long as your account is active. Upon account deletion, your personal data is removed, though anonymized usage statistics may be retained.

7. Changes to This Policy
We may update this policy from time to time. Significant changes will be communicated through the platform.

8. Contact
For privacy-related questions, please contact the platform administrator.`,

  terms_of_service: `Last updated: April 6, 2026

1. Acceptance of Terms
By accessing or using this platform, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.

2. Accounts
You are responsible for maintaining the security of your account and password. You must provide accurate information when creating an account. You must be at least 13 years old to use this platform.

3. Acceptable Use
You agree not to misuse the platform. This includes but is not limited to: uploading harmful or illegal content, attempting to access other users' accounts, interfering with the platform's operation, or using the platform for any unlawful purpose.

4. Content
Course creators retain ownership of the content they create. By publishing content on the platform, you grant the platform a license to display and distribute that content to learners. You must not upload content that infringes on others' intellectual property rights.

5. Learning Progress
We track your learning progress to provide personalized recommendations and spaced repetition. This data is associated with your account and is not shared publicly.

6. Availability
We strive to keep the platform available at all times but do not guarantee uninterrupted access. We may perform maintenance that temporarily affects availability.

7. Termination
We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time.

8. Limitation of Liability
The platform is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform.

9. Changes to Terms
We may modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.

10. Contact
For questions about these terms, please contact the platform administrator.`,
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
