import Link from "next/link"
import Image from "next/image"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { siteSetting } from "@/schema/settings"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserAvatar } from "@/components/user-avatar"
import { Button } from "@heroui/react"
import { SignOutButton } from "@/app/(app)/sign-out-button"

export async function SiteHeader() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  const settingsRows = await db
    .select()
    .from(siteSetting)
    .catch(() => [])
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]))

  const siteName = settings.site_name ?? "Asakiri"
  const canCreate =
    session &&
    (["admin", "creator"].includes(session.user.role ?? "") ||
      settings.course_creation === "open")

  return (
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
                <Link href="/learn"><Button variant="ghost" size="sm">Learning Hub</Button></Link>
                <Link href="/courses"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Courses</Button></Link>
                {canCreate && (
                  <Link href="/create"><Button variant="ghost" size="sm">Creator Studio</Button></Link>
                )}
                {session.user.role === "admin" && (
                  <Link href="/admin"><Button variant="ghost" size="sm" className="hidden sm:inline-flex">Admin</Button></Link>
                )}
              </>
            ) : (
              <Link href="/courses"><Button variant="ghost" size="sm">Courses</Button></Link>
            )}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <ThemeToggle />
          {session ? (
            <>
              <UserAvatar name={session.user.name ?? "?"} size={32} />
              <span className="text-muted hidden text-sm lg:inline">{session.user.name}</span>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in"><Button variant="ghost" size="sm">Sign in</Button></Link>
              <Link href="/sign-up"><Button size="sm">Sign up</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
