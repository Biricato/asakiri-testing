import Link from "next/link"
import Image from "next/image"
import { Button } from "@heroui/react"
import { ThemeToggle } from "@/components/theme-toggle"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export function PageHeader({
  backHref,
  label,
  title,
  children,
}: {
  backHref: string
  label: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="flex w-full items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Link href={backHref}>
            <Button variant="ghost" isIconOnly size="sm">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            </Button>
          </Link>
          <Link href="/" className="hidden shrink-0 sm:block">
            <Image src="/logo.svg" alt="Asakiri" width={24} height={24} />
          </Link>
          <div className="min-w-0">
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              {label}
            </p>
            <h1 className="truncate text-base font-semibold md:text-lg">{title}</h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {children}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
