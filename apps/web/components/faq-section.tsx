"use client"

import { useState } from "react"

type FAQ = { question: string; answer: string }

export function FAQSection({ items, supportEmail }: { items: FAQ[]; supportEmail?: string }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="rounded-xl border border-border">
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium"
            onClick={() => setOpen(open === i ? null : i)}
          >
            {item.question}
            <svg
              className={`size-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {open === i && (
            <div className="text-muted-foreground px-5 pb-4 text-sm">
              {item.answer}
            </div>
          )}
        </div>
      ))}
      {supportEmail && (
        <p className="text-muted-foreground pt-4 text-center text-sm">
          Have another question?{" "}
          <a href={`mailto:${supportEmail}`} className="text-foreground underline">
            Contact support
          </a>
        </p>
      )}
    </div>
  )
}
