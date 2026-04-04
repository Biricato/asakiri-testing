import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getCatalog } from "@/features/publish/actions/catalog"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default async function HomePage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  const courses = await getCatalog().catch(() => [])

  return (
    <div className="flex min-h-svh flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="Asakiri" width={32} height={32} />
            <span className="text-lg font-semibold">Asakiri</span>
          </div>
          <nav className="flex items-center gap-2 md:gap-4">
            <ThemeToggle />
            {session ? (
              <>
                <Button variant="ghost" size="sm" render={<Link href="/learn" />}>
                  Learning Hub
                </Button>
                {["admin", "creator"].includes(session.user.role ?? "") && (
                  <Button variant="ghost" size="sm" render={<Link href="/create" />}>
                    Creator Studio
                  </Button>
                )}
                {session.user.role === "admin" && (
                  <Button variant="ghost" size="sm" render={<Link href="/admin" />}>
                    Admin
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" render={<Link href="/sign-in" />}>
                  Sign in
                </Button>
                <Button size="sm" render={<Link href="/sign-up" />}>
                  Sign up
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center md:px-6 md:py-24">
          <p className="text-muted-foreground mb-4 text-xs font-semibold uppercase tracking-[0.3em]">
            Language Learning Platform
          </p>
          <h1 className="mx-auto max-w-3xl text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Master languages through interactive courses built by expert teachers
          </h1>
          <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-balance">
            Asakiri is where passionate language teachers create engaging courses and
            learners practice through interactive exercises with spaced repetition.
            Learn at your own pace, track your progress, and master vocabulary naturally.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" render={<Link href="/courses" />}>
              Browse courses
            </Button>
            {!session && (
              <Button variant="outline" size="lg" render={<Link href="/sign-up" />}>
                Start teaching
              </Button>
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
                  <Card className="h-full">
                    {c.coverImageUrl && (
                      <div className="relative aspect-square overflow-hidden rounded-t-2xl">
                        <img
                          src={c.coverImageUrl}
                          alt={c.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute bottom-4 left-4 flex gap-2">
                          <Badge className="bg-white/90 text-foreground">
                            {c.targetLanguage}
                          </Badge>
                          <Badge className="bg-white/90 text-foreground capitalize">
                            {c.difficulty}
                          </Badge>
                        </div>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {c.creatorName && (
                          <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                            {c.creatorName[0]}
                          </div>
                        )}
                        <span className="text-muted-foreground text-sm">
                          {c.creatorName ?? "Unknown"}
                        </span>
                      </div>
                      <CardTitle className="text-lg">{c.title}</CardTitle>
                    </CardHeader>
                    {!c.coverImageUrl && (
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{c.targetLanguage}</Badge>
                          <Badge variant="secondary" className="capitalize">
                            {c.difficulty}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {c.sourceLanguage} → {c.targetLanguage}
                        </p>
                      </CardContent>
                    )}
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
          <p className="text-muted-foreground text-sm">Asakiri</p>
          <p className="text-muted-foreground text-xs">
            Language learning, made open.
          </p>
        </div>
      </footer>
    </div>
  )
}
