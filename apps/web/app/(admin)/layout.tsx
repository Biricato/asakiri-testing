import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/features/admin/components/admin-sidebar"
import { Separator, Button } from "@heroui/react"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api
    .getSession({ headers: await headers() })
    .catch(() => null)

  if (!session || session.user.role !== "admin") redirect("/")

  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-muted-foreground text-sm">Admin</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {session.user.name}
              </span>
              <Link href="/">
                <Button variant="ghost" size="sm">
                  Back to app
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}
