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
import { Button } from "@heroui/react"

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
    <nav className="flex h-full w-56 flex-col border-r bg-background">
      <div className="px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-semibold">Asakiri</span>
        </Link>
      </div>
      <div className="flex-1 px-2 py-2">
        <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Admin</p>
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)

            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <HugeiconsIcon icon={item.icon} size={18} strokeWidth={2} />
                    <span>{item.title}</span>
                  </Button>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
