export type HowItWorksStep = { title: string; description: string }
export type Feature = { title: string; description: string }
export type TeacherFeature = { title: string; description: string }
export type FAQ = { question: string; answer: string }

export type SiteSettings = {
  registration_mode: "open" | "invite_only"
  course_creation: "open" | "approved" | "admin_only"
  default_role: "learner" | "creator"
  site_name: string
  site_tagline: string
  site_logo: string
  site_favicon: string
  hero_title: string
  hero_description: string
  github_url: string
  discord_url: string
  support_email: string
  show_github_button: "true" | "false"
  show_deploy_button: "true" | "false"
  privacy_policy: string
  terms_of_service: string
  // Homepage sections (stored as JSON strings in DB)
  how_it_works: string
  features: string
  for_teachers: string
  for_teachers_title: string
  for_teachers_description: string
  for_teachers_cta: string
  faq: string
  featured_course_1: string
  featured_course_2: string
  featured_course_3: string
}

export const defaultSettings: SiteSettings = {
  registration_mode: "open",
  course_creation: "open",
  default_role: "learner",
  site_name: "Asakiri",
  site_tagline: "Language Learning Platform",
  site_logo: "",
  site_favicon: "",
  hero_title: "Master languages through interactive courses built by expert teachers",
  hero_description: "Create engaging courses and learn through interactive exercises with spaced repetition. Learn at your own pace, track your progress, and master vocabulary naturally.",
  github_url: "https://github.com/AsakiriLingo/asakiri",
  discord_url: "",
  support_email: "",
  show_github_button: "true",
  show_deploy_button: "true",
  how_it_works: JSON.stringify([
    { title: "Browse courses", description: "Explore courses created by expert teachers. Filter by language, level, and topic to find the perfect course for your goals." },
    { title: "Enroll and learn", description: "Access structured lessons with rich content. Practice with interactive exercises including multiple choice, fill-in-the-blank, and sentence building." },
    { title: "Master with SRS", description: "Review vocabulary at optimal intervals using spaced repetition. Track your progress and watch your fluency grow over time." },
  ] satisfies HowItWorksStep[]),
  features: JSON.stringify([
    { title: "Interactive exercises", description: "Practice with multiple question types including MCQ, fill-in-the-blank, sentence builder, and word cloze exercises." },
    { title: "Spaced repetition", description: "Master vocabulary with our SRS system that schedules reviews at scientifically optimal intervals for long-term retention." },
    { title: "Progress tracking", description: "Monitor your learning journey with detailed statistics. See your completion rates, streak counts, and improvement over time." },
    { title: "Rich lesson content", description: "Learn from multimedia lessons featuring text, images, videos, tables, and interactive elements for engaging learning." },
    { title: "Self-paced learning", description: "Study on your schedule. Access lessons and exercises anytime, anywhere, and progress at your own comfortable pace." },
    { title: "Expert teachers", description: "Learn from passionate educators who design structured courses with proven teaching methods and authentic materials." },
  ] satisfies Feature[]),
  for_teachers: JSON.stringify([
    { title: "Rich lesson editor", description: "Create engaging lessons with our powerful editor. Add text formatting, images, videos, tables, and more with an intuitive interface." },
    { title: "Exercise builder", description: "Design interactive exercises with multiple formats. Build word banks, create MCQs, design sentence builders, and set up spaced repetition schedules." },
    { title: "Collaboration tools", description: "Invite co-authors to your courses. Work together with other teachers, manage permissions, and build comprehensive learning experiences." },
  ] satisfies TeacherFeature[]),
  for_teachers_title: "Share your expertise with the world",
  for_teachers_description: "Asakiri provides powerful authoring tools to help you create professional language courses. Design structured lessons, build interactive exercises, and reach learners globally.",
  for_teachers_cta: "Start creating your course",
  faq: JSON.stringify([
    { question: "Is Asakiri free to use?", answer: "Learners can browse and enroll in courses for free. Teachers can create and publish courses for free." },
    { question: "What languages can I learn?", answer: "Asakiri supports courses for any language. The available languages depend on what our community of teachers has created. Browse the course catalog to see current offerings." },
    { question: "How does spaced repetition work?", answer: "Spaced repetition (SRS) is a scientifically proven learning technique. Asakiri schedules vocabulary reviews at increasing intervals based on how well you remember each item. Words you struggle with appear more frequently, while mastered words are reviewed less often." },
    { question: "Can I create my own course?", answer: "Yes! Any registered user can become a teacher. Use our powerful authoring tools to create lessons with rich content, design interactive exercises, and publish your course for learners worldwide." },
    { question: "Do I need to complete courses in order?", answer: "That depends on how the teacher structured the course. Most courses are designed with a recommended order, but you can typically navigate to any lesson within an enrolled course and learn at your own pace." },
    { question: "Can I track my learning progress?", answer: "Absolutely! Asakiri tracks your completion status for lessons, exercise performance, review streaks, and SRS schedules. You can monitor your progress through your learner dashboard." },
  ] satisfies FAQ[]),
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
  featured_course_1: "",
  featured_course_2: "",
  featured_course_3: "",
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
