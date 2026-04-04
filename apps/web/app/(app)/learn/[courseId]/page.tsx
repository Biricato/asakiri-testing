import { notFound } from "next/navigation"
import Link from "next/link"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { course } from "@/schema/course"
import { auth } from "@/lib/auth"
import { getLearningPath } from "@/features/learn/actions/enrolled"
import { LearningPath } from "@/features/learn/components/learning-path"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  RepeatIcon,
  UserIcon,
  FlashIcon,
  TimeQuarter02Icon,
  FireIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@workspace/ui/lib/utils"

export default async function CourseLearningPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const rows = await db
    .select()
    .from(course)
    .where(eq(course.id, courseId))
    .limit(1)
  const c = rows[0]
  if (!c) notFound()

  const [units, session] = await Promise.all([
    getLearningPath(courseId),
    auth.api.getSession({ headers: await headers() }).catch(() => null),
  ])

  const sidebarItems = [
    { label: "Home", icon: Home01Icon, href: `/learn/${courseId}`, active: true },
    { label: "Practice", icon: RepeatIcon, href: `/learn/${courseId}/practice`, active: false },
    { label: "Profile", icon: UserIcon, href: "/settings", active: false },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Learn sidebar */}
      <aside className="hidden w-60 border-r border-border bg-background md:sticky md:top-0 md:flex md:h-screen">
        <div className="flex h-full w-full flex-col px-6 py-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex size-10 items-center justify-center rounded-2xl transition hover:bg-muted">
                <img src="/logo.svg" alt="Asakiri" className="size-6" />
              </Link>
              <div className="flex-1 overflow-hidden">
                <Link href="/" className="text-sm font-semibold leading-tight transition hover:text-primary">
                  Asakiri
                </Link>
                <p className="truncate text-xs text-muted-foreground">{c.title}</p>
              </div>
            </div>
          </div>

          <nav className="mt-8">
            <ul className="space-y-1.5">
              {sidebarItems.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition",
                      item.active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <HugeiconsIcon icon={item.icon} size={20} strokeWidth={2} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-6">
            <Link
              href="/learn"
              className="flex items-center gap-3 rounded-2xl border border-border px-3 py-3"
            >
              <div className="flex size-6 items-center justify-center rounded bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Home01Icon} size={14} />
              </div>
              <div>
                <p className="text-sm font-medium">Continue learning</p>
                <p className="text-xs text-muted-foreground">Pick up right where you left off.</p>
              </div>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header with stats */}
        <header className="sticky top-0 z-40 border-b border-border bg-background">
          <div className="flex items-center justify-between px-6 py-3">
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Learning Path
              </p>
              <h1 className="text-lg font-semibold">{c.title}</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={FlashIcon} size={18} className="text-primary" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">XP</p>
                  <p className="text-sm font-semibold">0</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={TimeQuarter02Icon} size={18} className="text-secondary" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Time</p>
                  <p className="text-sm font-semibold">0 min</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={FireIcon} size={18} className="text-destructive" />
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Streak</p>
                  <p className="text-sm font-semibold">0</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Learning path content */}
        <main className="flex-1 p-6">
          <div className="mx-auto max-w-lg">
            <LearningPath courseId={courseId} units={units} />
          </div>
        </main>
      </div>
    </div>
  )
}
