"use client"

import { useTheme } from "next-themes"
import { Button } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Sun01Icon, Moon01Icon } from "@hugeicons/core-free-icons"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      isIconOnly
      size="sm"
      onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      <HugeiconsIcon
        icon={resolvedTheme === "dark" ? Sun01Icon : Moon01Icon}
        size={16}
        strokeWidth={2}
      />
    </Button>
  )
}
