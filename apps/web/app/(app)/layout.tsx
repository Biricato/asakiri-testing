import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { siteSetting } from "@/schema/settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import { SignOutButton } from "./sign-out-button"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  if (!session) redirect("/sign-in")

  // Fetch settings
  const settingsRows = await db
    .select()
    .from(siteSetting)
    .catch(() => [])
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]))

  const siteName = settings.site_name ?? "Asakiri"
  const courseCreationPolicy = settings.course_creation ?? "open"
  const canCreate =
    ["admin", "creator"].includes(session.user.role ?? "") ||
    courseCreationPolicy === "open"

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
          {/* Left: logo + nav */}
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image src="/logo.svg" alt={siteName} width={32} height={32} />
              <span className="hidden text-lg font-semibold sm:inline">{siteName}</span>
            </Link>
            <nav className="flex items-center gap-0.5 overflow-x-auto">
              <Button variant="ghost" size="sm" render={<Link href="/learn" />}>
                Learning Hub
              </Button>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" render={<Link href="/courses" />}>
                Courses
              </Button>
              {canCreate && (
                <Button variant="ghost" size="sm" render={<Link href="/create" />}>
                  Creator Studio
                </Button>
              )}
              {session.user.role === "admin" && (
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex" render={<Link href="/admin" />}>
                  Admin
                </Button>
              )}
            </nav>
          </div>

          {/* Right: user info + actions */}
          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            <ThemeToggle />
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-muted-foreground hidden text-sm lg:inline">
              {session.user.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
