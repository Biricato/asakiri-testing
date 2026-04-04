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
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-semibold">
            Asakiri
          </Link>
          <nav className="flex items-center gap-1">
            <Button variant="ghost" size="sm" render={<Link href="/learn" />}>
              Learn
            </Button>
            {["admin", "creator"].includes(session.user.role ?? "") && (
              <Button variant="ghost" size="sm" render={<Link href="/create" />}>
                Create
              </Button>
            )}
            {session.user.role === "admin" && (
              <Button variant="ghost" size="sm" render={<Link href="/admin" />}>
                Admin
              </Button>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-sm">
            {session.user.name}
          </span>
          <Button variant="ghost" size="sm" render={<Link href="/settings" />}>
            Settings
          </Button>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
