import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCatalog } from "@/features/publish/actions/catalog"
import { getSettings } from "@/features/admin/actions/settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { SignOutButton } from "./(app)/sign-out-button"
import { Button, Chip, Card } from "@heroui/react"

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
            <ThemeToggle />
            {session ? (
              <>
                <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {session.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
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

        {/* Course catalog */}
        <section className="mx-auto max-w-6xl px-4 pb-16 md:px-6">
          <h2 className="text-2xl font-semibold">Start learning today</h2>
          <p className="text-muted-foreground mt-2">
            Browse courses created by expert teachers. Each course includes structured
            lessons, interactive exercises, and progress tracking to help you master
            your target language.
          </p>

          {courses.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {courses.map((c) => (
                <Link key={c.id} href={`/courses/${c.slug}`}>
                  <Card className="h-full overflow-hidden">
                    {c.coverImageUrl ? (
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={c.coverImageUrl}
                          alt={c.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex aspect-[4/3] items-center justify-center bg-surface-secondary">
                        <span className="text-4xl font-bold text-muted/30">
                          {c.targetLanguage.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <Card.Header>
                      <div className="flex items-center gap-3">
                        <div className="flex size-6 items-center justify-center rounded-full bg-surface-secondary text-xs font-medium">
                          {(c.creatorName ?? "?")[0]}
                        </div>
                        <span className="text-muted text-sm">
                          {c.creatorName ?? "Unknown"}
                        </span>
                      </div>
                      <Card.Title className="text-lg">{c.title}</Card.Title>
                    </Card.Header>
                    <Card.Content>
                      <div className="flex items-center gap-2">
                        <Chip variant="secondary">{c.targetLanguage}</Chip>
                        <Chip variant="secondary" className="capitalize">
                          {c.difficulty}
                        </Chip>
                      </div>
                    </Card.Content>
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
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 md:px-6">
          <p className="text-muted-foreground text-sm">{siteName}</p>
          <p className="text-muted-foreground text-xs">
            {tagline}
          </p>
        </div>
      </footer>
    </div>
  )
}
