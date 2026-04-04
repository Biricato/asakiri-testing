"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@heroui/react"

export function Pagination({
  page,
  totalPages,
}: {
  page: number
  totalPages: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  function buildHref(p: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (p <= 1) {
      params.delete("page")
    } else {
      params.set("page", String(p))
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <div className="mt-6 flex items-center justify-between">
      <p className="text-muted text-sm">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={buildHref(page - 1)}>
            <Button variant="outline" size="sm">Previous</Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" isDisabled>Previous</Button>
        )}
        {page < totalPages ? (
          <Link href={buildHref(page + 1)}>
            <Button variant="outline" size="sm">Next</Button>
          </Link>
        ) : (
          <Button variant="outline" size="sm" isDisabled>Next</Button>
        )}
      </div>
    </div>
  )
}
