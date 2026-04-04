"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  BookOpen02Icon,
  Image01Icon,
  BarChartIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

const navItems = [
  { id: "home", label: "Home", icon: Home01Icon, href: "" },
  { id: "course-details", label: "Course details", icon: BookOpen02Icon, href: "/settings" },
  { id: "assets", label: "Assets", icon: Image01Icon, href: "/settings" },
  { id: "stats", label: "Stats", icon: BarChartIcon, href: "/settings" },
  { id: "profile", label: "Creator Profile", icon: UserIcon, href: "/settings" },
]

export function CreatorSidebar({
  courseId,
  courseTitle,
}: {
  courseId?: string
  courseTitle?: string
}) {
  const pathname = usePathname()

  const basePath = courseId ? `/create/${courseId}` : "/create"

  return (
    <aside className="hidden w-60 border-r border-border bg-background md:sticky md:top-0 md:flex md:h-screen">
      <div className="flex h-full w-full flex-col px-6 py-8">
        <div className="flex-1 space-y-8 overflow-y-auto">
          {/* Logo + course name */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex size-10 items-center justify-center rounded-2xl transition hover:bg-muted"
              >
                <img src="/logo.svg" alt="Asakiri" className="size-6" />
              </Link>
              <div className="flex-1 overflow-hidden">
                <Link href="/" className="text-sm font-semibold leading-tight transition hover:text-primary">
                  Asakiri
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {courseTitle ?? "Creator Studio"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav>
            <ul className="space-y-1.5">
              {navItems.map((item) => {
                if (item.id !== "home" && !courseId) return null

                const href = item.id === "home" ? basePath : `${basePath}${item.href}`
                const isActive =
                  item.id === "home"
                    ? pathname === basePath
                    : pathname.includes(item.href) && item.id !== "home"

                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <HugeiconsIcon icon={item.icon} size={20} strokeWidth={2} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>

      </div>
    </aside>
  )
}
