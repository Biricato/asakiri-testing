"use client"

import { useEffect, useRef, useTransition } from "react"
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
  sections: { id: string; content: unknown }[]
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

  // Render TipTap JSON as HTML (simplified — renders text content)
  function renderContent(content: unknown) {
    if (!content || typeof content !== "object") {
      return <p className="text-muted-foreground">No content yet.</p>
    }

    const doc = content as { type: string; content?: unknown[] }
    if (doc.type !== "doc" || !doc.content) {
      return <p className="text-muted-foreground">No content yet.</p>
    }

    return (
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{
          __html: renderNodes(doc.content),
        }}
      />
    )
  }

  return (
    <div className="space-y-8">
      {sections.map((s, i) => (
        <div key={s.id}>
          {renderContent(s.content)}
          {i < sections.length - 1 && <hr className="mt-8" />}
        </div>
      ))}

      <div ref={bottomRef} className="flex items-center gap-3 border-t pt-4">
        {isCompleted ? (
          <p className="text-muted-foreground text-sm">Lesson completed</p>
        ) : (
          <Button onClick={handleComplete} disabled={pending}>
            {pending ? "Marking..." : "Mark as complete"}
          </Button>
        )}
      </div>
    </div>
  )
}

// Simple TipTap JSON to HTML renderer
function renderNodes(nodes: unknown[]): string {
  return nodes
    .map((node) => {
      const n = node as { type: string; content?: unknown[]; attrs?: Record<string, unknown>; text?: string; marks?: { type: string }[] }

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
          return `<div class="my-2 p-3 bg-muted rounded-lg"><audio controls src="${n.attrs?.src ?? ""}"></audio></div>`
        case "youtube":
          return `<iframe src="${n.attrs?.src ?? ""}" width="640" height="360" frameborder="0" allowfullscreen></iframe>`
        case "table":
          return `<table>${n.content ? renderNodes(n.content) : ""}</table>`
        case "tableRow":
          return `<tr>${n.content ? renderNodes(n.content) : ""}</tr>`
        case "tableCell":
          return `<td>${n.content ? renderNodes(n.content) : ""}</td>`
        case "tableHeader":
          return `<th>${n.content ? renderNodes(n.content) : ""}</th>`
        case "text": {
          let text = n.text ?? ""
          if (n.marks) {
            for (const mark of n.marks) {
              if (mark.type === "bold") text = `<strong>${text}</strong>`
              if (mark.type === "italic") text = `<em>${text}</em>`
              if (mark.type === "underline") text = `<u>${text}</u>`
              if (mark.type === "strike") text = `<s>${text}</s>`
              if (mark.type === "code") text = `<code>${text}</code>`
              if (mark.type === "link") {
                const href = (mark as unknown as { attrs: { href: string } }).attrs?.href ?? "#"
                text = `<a href="${href}" target="_blank" rel="noopener">${text}</a>`
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
