import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
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

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
                A
              </div>
              <span className="hidden text-lg font-semibold md:inline">Asakiri</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Button variant="ghost" size="sm" render={<Link href="/learn" />}>
                Learning Hub
              </Button>
              <Button variant="ghost" size="sm" render={<Link href="/courses" />}>
                Courses
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
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-muted-foreground hidden text-sm md:inline">
              {session.user.name}
            </span>
            <Button variant="ghost" size="sm" render={<Link href="/settings" />}>
              Settings
            </Button>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
