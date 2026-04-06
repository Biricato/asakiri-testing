import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCatalog } from "@/features/publish/actions/catalog"
import { getSettings } from "@/features/admin/actions/settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { GitHubButton } from "@/components/github-button"
import { SiteFooter } from "@/components/site-footer"
import { FAQSection } from "@/components/faq-section"
import { SignOutButton } from "./(app)/sign-out-button"
import { CoursePlaceholder } from "@/components/course-placeholder"
import { Button, Chip, Card } from "@heroui/react"
import type { HowItWorksStep, Feature, TeacherFeature, FAQ } from "@/features/admin/types"

export default async function HomePage() {
  const [session, courses, settings] = await Promise.all([
    auth.api.getSession({ headers: await headers() }).catch(() => null),
    getCatalog().catch(() => []),
    getSettings().catch(() => null),
  ])

  const siteName = settings?.site_name ?? "Asakiri"
  const tagline = settings?.site_tagline ?? "Language Learning Platform"
  const heroTitle = settings?.hero_title ?? "Master languages through interactive courses built by expert teachers"
  const heroDesc = settings?.hero_description ?? "Create engaging courses and learn through interactive exercises with spaced repetition."
  const showTeaching = !session && settings?.course_creation === "open"
  const canCreate = session && (
    ["admin", "creator"].includes(session.user.role ?? "") ||
    settings?.course_creation === "open"
  )

  const howItWorks: HowItWorksStep[] = JSON.parse(settings?.how_it_works ?? "[]")
  const features: Feature[] = JSON.parse(settings?.features ?? "[]")
  const teacherFeatures: TeacherFeature[] = JSON.parse(settings?.for_teachers ?? "[]")
  const teacherTitle = settings?.for_teachers_title ?? ""
  const teacherDesc = settings?.for_teachers_description ?? ""
  const teacherCta = settings?.for_teachers_cta ?? ""
  const faqItems: FAQ[] = JSON.parse(settings?.faq ?? "[]")

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background">
        <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image src="/logo.svg" alt={siteName} width={32} height={32} />
              <span className="hidden text-lg font-semibold sm:inline">{siteName}</span>
            </Link>
            <nav className="flex items-center gap-0.5">
              {session ? (
                <>
                  <Link href="/learn"><Button variant="ghost" size="sm">
                    Learning Hub
                  </Button></Link>
                  <Link href="/courses"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Courses
                  </Button></Link>
                  {canCreate && (
                    <Link href="/create"><Button variant="ghost" size="sm">
                      Creator Studio
                    </Button></Link>
                  )}
                  {session.user.role === "admin" && (
                    <Link href="/admin"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                      Admin
                    </Button></Link>
                  )}
                </>
              ) : (
                <>
                  <Link href="/courses"><Button variant="ghost" size="sm">
                    Courses
                  </Button></Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {settings?.discord_url && (
              <a href={settings.discord_url} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" aria-label="Discord">
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                </Button>
              </a>
            )}
            {(() => {
              const ghUrl = settings?.github_url || "https://github.com/AsakiriLingo/asakiri"
              const showGh = (settings?.show_github_button ?? "true") !== "false"
              const showDep = (settings?.show_deploy_button ?? "true") !== "false"
              return (
                <>
                  {showGh && ghUrl && <GitHubButton url={ghUrl} />}
                  {showDep && ghUrl && (
                    <a href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(ghUrl)}`} target="_blank" rel="noopener noreferrer">
                      <Button size="sm">Deploy</Button>
                    </a>
                  )}
                </>
              )
            })()}
            <ThemeToggle />
            {session ? (
              <>
                <UserAvatar name={session.user.name ?? "?"} size={32} />
                <span className="text-muted-foreground hidden text-sm lg:inline">
                  {session.user.name}
                </span>
                <SignOutButton />
              </>
            ) : (
              <>
                <Link href="/sign-in"><Button variant="ghost" size="sm">
                  Sign in
                </Button></Link>
                <Link href="/sign-up"><Button size="sm">
                  Sign up
                </Button></Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <p className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-[0.3em]">
            {tagline}
          </p>
          <h1 className="mx-auto max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {heroTitle}
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-balance">
            {heroDesc}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/courses"><Button size="lg">
              Browse courses
            </Button></Link>
            {showTeaching && (
              <Link href="/sign-up"><Button variant="outline" size="lg">
                Start teaching
              </Button></Link>
            )}
          </div>
        </section>

        {/* How it works */}
        {howItWorks.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
              <h2 className="text-center text-2xl font-semibold">How it works</h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-center">
                Start your language learning journey in three simple steps
              </p>
              <div className="mt-12 grid gap-8 sm:grid-cols-3">
                {howItWorks.map((step, i) => (
                  <div key={i} className="text-center">
                    <div className="bg-primary text-primary-foreground mx-auto flex size-10 items-center justify-center rounded-full text-lg font-semibold">
                      {i + 1}
                    </div>
                    <h3 className="mt-4 font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Course catalog */}
        <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
          <h2 className="text-2xl font-semibold">Explore Courses</h2>
          <p className="text-muted-foreground mt-2">
            Start learning with courses created by expert teachers
          </p>

          {courses.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((c) => (
                <Link key={c.id} href={`/courses/${c.slug}`}>
                  <Card className="h-full gap-2">
                    {c.coverImageUrl ? (
                      <img
                        src={c.coverImageUrl}
                        alt={c.title}
                        className="pointer-events-none aspect-[4/3] w-full rounded-2xl object-cover select-none"
                        loading="lazy"
                      />
                    ) : (
                      <CoursePlaceholder title={c.title} />
                    )}
                    <Card.Header>
                      <Card.Title>{c.title}</Card.Title>
                      <Card.Description>
                        {c.sourceLanguage} → {c.targetLanguage}
                      </Card.Description>
                    </Card.Header>
                    <Card.Footer className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserAvatar name={c.creatorName ?? "?"} size={20} />
                        <span className="text-xs">{c.creatorName ?? "Unknown"}</span>
                      </div>
                      <Chip variant="soft" className="text-xs capitalize">
                        {c.difficulty}
                      </Chip>
                    </Card.Footer>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mt-8">
              No courses published yet. Be the first to create one!
            </p>
          )}
        </section>

        {/* Features */}
        {features.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
              <h2 className="text-center text-2xl font-semibold">Everything you need to succeed</h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-center">
                Powerful features designed to make language learning effective and enjoyable
              </p>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((f, i) => (
                  <div key={i} className="rounded-xl border border-border p-6">
                    <h3 className="font-semibold">{f.title}</h3>
                    <p className="text-muted-foreground mt-2 text-sm">{f.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* For Teachers */}
        {teacherFeatures.length > 0 && teacherTitle && (
          <section className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-[0.3em]">For Teachers</p>
              <h2 className="text-2xl font-semibold">{teacherTitle}</h2>
              <p className="text-muted-foreground mt-3">{teacherDesc}</p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {teacherFeatures.map((f, i) => (
                <div key={i} className="rounded-xl border border-border p-6">
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm">{f.description}</p>
                </div>
              ))}
            </div>
            {teacherCta && (
              <div className="mt-10 text-center">
                <Link href={session ? "/create" : "/sign-up"}>
                  <Button size="lg">{teacherCta}</Button>
                </Link>
              </div>
            )}
          </section>
        )}

        {/* FAQ */}
        {faqItems.length > 0 && (
          <section className="border-t border-border">
            <div className="mx-auto max-w-3xl px-4 py-16 md:px-6 md:py-24">
              <h2 className="text-center text-2xl font-semibold">Frequently asked questions</h2>
              <p className="text-muted-foreground mx-auto mt-2 max-w-lg text-center">
                Everything you need to know about learning and teaching on {siteName}
              </p>
              <div className="mt-10">
                <FAQSection items={faqItems} supportEmail={settings?.support_email || undefined} />
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter settings={settings} />
    </div>
  )
}
