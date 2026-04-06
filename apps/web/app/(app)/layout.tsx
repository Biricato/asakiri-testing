import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { siteSetting } from "@/schema/settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { GitHubButton } from "@/components/github-button"
import { MobileMenu } from "@/components/mobile-menu"
import { Button } from "@heroui/react"
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

  const navItems = [
    { href: "/learn", label: "Learning Hub" },
    { href: "/courses", label: "Courses" },
    ...(canCreate ? [{ href: "/create", label: "Creator Studio" }] : []),
    ...(session.user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
  ]

  const ghUrl = settings.github_url || "https://github.com/AsakiriLingo/asakiri"
  const showGh = (settings.show_github_button ?? "true") !== "false" && ghUrl
  const showDep = (settings.show_deploy_button ?? "true") !== "false" && ghUrl

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="relative flex w-full items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image src="/logo.svg" alt={siteName} width={32} height={32} />
              <span className="hidden text-lg font-semibold sm:inline">{siteName}</span>
            </Link>
            <nav className="hidden items-center gap-0.5 md:flex">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" size="sm">{item.label}</Button>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
            {settings.discord_url && (
              <a href={settings.discord_url} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" aria-label="Discord">
                  <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                </Button>
              </a>
            )}
            {showGh && <span className="hidden sm:inline-flex"><GitHubButton url={ghUrl} /></span>}
            {showDep && (
              <a href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(ghUrl)}`} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex">
                <Button size="sm">Deploy</Button>
              </a>
            )}
            <ThemeToggle />
            <Link href="/settings" className="flex items-center gap-1.5">
              <UserAvatar name={session.user.name ?? "?"} size={32} />
            </Link>
            <SignOutButton />
            <MobileMenu items={navItems} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
