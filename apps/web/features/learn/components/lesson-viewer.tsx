"use client"

import { useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { markLessonComplete } from "../actions/progress"

export function LessonViewer({
  lessonId,
  sections,
  isCompleted,
}: {
  lessonId: string
  sections: { id: string; title: string | null; content: unknown }[]
  isCompleted: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const bottomRef = useRef<HTMLDivElement>(null)

  function handleComplete() {
    startTransition(async () => {
      await markLessonComplete(lessonId)
      toast.success("Lesson completed!")
      router.refresh()
    })
  }

  function renderContent(content: unknown) {
    if (!content || typeof content !== "object") {
      return <p className="text-muted-foreground italic">No content yet.</p>
    }

    const doc = content as { type: string; content?: unknown[] }
    if (doc.type !== "doc" || !doc.content) {
      return <p className="text-muted-foreground italic">No content yet.</p>
    }

    return (
      <div
        className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-p:leading-7 prose-a:text-primary prose-a:underline prose-table:border prose-th:border prose-th:px-3 prose-th:py-2 prose-td:border prose-td:px-3 prose-td:py-2 prose-img:rounded-lg"
        dangerouslySetInnerHTML={{
          __html: renderNodes(doc.content),
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {sections.map((s) => (
        <div key={s.id} className="rounded-2xl border border-border">
          {/* Section title */}
          {s.title && (
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold">{s.title}</h2>
            </div>
          )}

          {/* Section content */}
          <div className="px-6 py-6">
            {renderContent(s.content)}
          </div>
        </div>
      ))}

      {/* Mark complete */}
      <div ref={bottomRef} className="flex items-center justify-center py-4">
        {isCompleted ? (
          <p className="text-muted-foreground text-sm">Lesson completed</p>
        ) : (
          <Button onClick={handleComplete} disabled={pending} size="lg">
            {pending ? "Marking..." : "Mark as complete"}
          </Button>
        )}
      </div>
    </div>
  )
}

// TipTap JSON to HTML renderer
function renderNodes(nodes: unknown[]): string {
  return nodes
    .map((node) => {
      const n = node as {
        type: string
        content?: unknown[]
        attrs?: Record<string, unknown>
        text?: string
        marks?: { type: string; attrs?: Record<string, unknown> }[]
      }

      switch (n.type) {
        case "paragraph":
          return `<p>${n.content ? renderNodes(n.content) : ""}</p>`
        case "heading": {
          const level = (n.attrs?.level ?? 2) as number
          return `<h${level}>${n.content ? renderNodes(n.content) : ""}</h${level}>`
        }
        case "bulletList":
          return `<ul>${n.content ? renderNodes(n.content) : ""}</ul>`
        case "orderedList":
          return `<ol>${n.content ? renderNodes(n.content) : ""}</ol>`
        case "listItem":
          return `<li>${n.content ? renderNodes(n.content) : ""}</li>`
        case "blockquote":
          return `<blockquote>${n.content ? renderNodes(n.content) : ""}</blockquote>`
        case "codeBlock":
          return `<pre><code>${n.content ? renderNodes(n.content) : ""}</code></pre>`
        case "image":
          return `<img src="${n.attrs?.src ?? ""}" alt="${n.attrs?.alt ?? ""}" />`
        case "audio":
          return `<div class="my-3 flex items-center gap-3 rounded-xl bg-muted/50 p-4"><audio controls preload="metadata" class="h-8 flex-1"><source src="${n.attrs?.src ?? ""}" /></audio></div>`
        case "youtube":
          return `<div class="aspect-video overflow-hidden rounded-xl"><iframe src="${n.attrs?.src ?? ""}" class="h-full w-full" frameborder="0" allowfullscreen></iframe></div>`
        case "table":
          return `<table class="border-collapse">${n.content ? renderNodes(n.content) : ""}</table>`
        case "tableRow":
          return `<tr>${n.content ? renderNodes(n.content) : ""}</tr>`
        case "tableCell":
          return `<td>${n.content ? renderNodes(n.content) : ""}</td>`
        case "tableHeader":
          return `<th>${n.content ? renderNodes(n.content) : ""}</th>`
        case "text": {
          let text = escapeHtml(n.text ?? "")
          if (n.marks) {
            for (const mark of n.marks) {
              if (mark.type === "bold") text = `<strong>${text}</strong>`
              if (mark.type === "italic") text = `<em>${text}</em>`
              if (mark.type === "underline") text = `<u>${text}</u>`
              if (mark.type === "strike") text = `<s>${text}</s>`
              if (mark.type === "code") text = `<code>${text}</code>`
              if (mark.type === "link") {
                const href = mark.attrs?.href ?? "#"
                text = `<a href="${href}" target="_blank" rel="noopener">${text}</a>`
              }
              if (mark.type === "textStyle") {
                const color = mark.attrs?.color as string | undefined
                if (color) text = `<span style="color:${color}">${text}</span>`
              }
              if (mark.type === "highlight") {
                const bg = (mark.attrs?.color as string) ?? "#fef08a"
                text = `<mark style="background-color:${bg}">${text}</mark>`
              }
            }
          }
          return text
        }
        case "hardBreak":
          return "<br />"
        default:
          return n.content ? renderNodes(n.content) : ""
      }
    })
    .join("")
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
