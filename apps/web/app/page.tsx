import Link from "next/link"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { Button } from "@workspace/ui/components/button"

export default async function HomePage() {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-semibold">Asakiri</h1>
        <nav className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-muted-foreground text-sm">
                {session.user.name}
                {session.user.role === "admin" && (
                  <span className="text-muted-foreground ml-1 text-xs">
                    (admin)
                  </span>
                )}
              </span>
              {["admin", "creator"].includes(session.user.role ?? "") && (
                <Button variant="outline" size="sm" render={<Link href="/create" />}>
                  Create
                </Button>
              )}
              <Button variant="outline" size="sm" render={<Link href="/learn" />}>
                Learn
              </Button>
              {session.user.role === "admin" && (
                <Button variant="outline" size="sm" render={<Link href="/admin" />}>
                  Admin
                </Button>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" render={<Link href="/sign-in" />}>
                Sign in
              </Button>
              <Button size="sm" render={<Link href="/sign-up" />}>
                Sign up
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <h2 className="text-3xl font-bold tracking-tight">
          Language Learning Platform
        </h2>
        <p className="text-muted-foreground max-w-md text-center">
          Create and share interactive language courses with exercises, spaced
          repetition, and rich content.
        </p>
        {!session && (
          <Button size="lg" render={<Link href="/sign-up" />}>
            Get started
          </Button>
        )}
      </main>
    </div>
  )
}
