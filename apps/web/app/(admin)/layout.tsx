import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/features/admin/components/admin-sidebar"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar"
import { Separator } from "@workspace/ui/components/separator"
import { Button } from "@workspace/ui/components/button"

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
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex flex-1 items-center justify-between">
            <span className="text-muted-foreground text-sm">Admin</span>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">
                {session.user.name}
              </span>
              <Button variant="ghost" size="sm" render={<Link href="/" />}>
                Back to app
              </Button>
            </div>
          </div>
        </header>
        <div className="flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
