import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCatalog } from "@/features/publish/actions/catalog"
import { getSettings } from "@/features/admin/actions/settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { SignOutButton } from "./(app)/sign-out-button"
import { CoursePlaceholder } from "@/components/course-placeholder"
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
