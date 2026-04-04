"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  UserMultipleIcon,
  BookOpen02Icon,
  Settings02Icon,
  MailSend02Icon,
} from "@hugeicons/core-free-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar"

const navItems = [
  { title: "Dashboard", href: "/admin", icon: DashboardSquare01Icon },
  { title: "Users", href: "/admin/users", icon: UserMultipleIcon },
  { title: "Courses", href: "/admin/courses", icon: BookOpen02Icon },
  { title: "Invites", href: "/admin/invites", icon: MailSend02Icon },
  { title: "Settings", href: "/admin/settings", icon: Settings02Icon },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 px-2 py-1">
          <span className="text-lg font-semibold">Asakiri</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href)
                    }
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
