import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { auth } from "@/lib/auth"
import { AdminNav } from "@/features/admin/components/admin-nav"
import { MobileMenu } from "@/components/mobile-menu"
import { Button } from "@heroui/react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  if (!session || session.user.role !== "admin") redirect("/")

  const mobileItems = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/invites", label: "Invites" },
    { href: "/admin/settings", label: "Settings" },
  ]

  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
        <div className="relative flex w-full items-center justify-between px-4 py-3 md:px-6">
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image src="/logo.svg" alt="Asakiri" width={32} height={32} />
              <span className="hidden text-lg font-semibold sm:inline">Admin</span>
            </Link>
            <nav className="hidden items-center gap-0.5 md:flex">
              <AdminNav />
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="text-muted-foreground hidden text-sm sm:inline">{session.user.name}</span>
            <Link href="/">
              <Button variant="ghost" size="sm">Back to app</Button>
            </Link>
            <MobileMenu items={mobileItems} />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  )
}
