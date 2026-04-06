"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@heroui/react"

type NavItem = { href: string; label: string }

export function MobileMenu({
  items,
  children,
}: {
  items: NavItem[]
  children?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        aria-label="Menu"
        className="md:hidden"
        onPress={() => setOpen(!open)}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </Button>

      {open && (
        <div className="absolute left-0 top-full w-full border-b border-border bg-background px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
          {children && (
            <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2">
              {children}
            </div>
          )}
        </div>
      )}
    </>
  )
}
