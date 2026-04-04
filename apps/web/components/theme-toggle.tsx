"use client"

import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      title="Toggle theme"
    >
      <HugeiconsIcon
        icon={resolvedTheme === "dark" ? Sun01Icon : Moon01Icon}
        size={16}
        strokeWidth={2}
      />
    </Button>
  )
}
