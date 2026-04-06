"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@heroui/react"

const navItems = [
  { title: "Dashboard", href: "/admin" },
  { title: "Users", href: "/admin/users" },
  { title: "Courses", href: "/admin/courses" },
  { title: "Invites", href: "/admin/invites" },
  { title: "Settings", href: "/admin/settings" },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <>
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href)

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
            >
              {item.title}
            </Button>
          </Link>
        )
      })}
    </>
  )
}

export { navItems }
