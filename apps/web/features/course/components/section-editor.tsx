"use client"

import { useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { TiptapEditor } from "@/features/tiptap/components/editor"
import { saveContent, createSection, deleteSection } from "../actions/sections"
import type { Section } from "../types"

export function SectionEditor({
  lessonId,
  sections,
}: {
  lessonId: string
  sections: Section[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleSave = useCallback(
    (sectionId: string) => (content: unknown) => {
      // Fire-and-forget save, no transition needed for auto-save
      saveContent(sectionId, content)
    },
    [],
  )

  function handleAddSection() {
    startTransition(async () => {
      await createSection(lessonId)
      toast.success("Section added")
      router.refresh()
    })
  }

  function handleDeleteSection(sectionId: string) {
    startTransition(async () => {
      await deleteSection(sectionId)
      toast.success("Section deleted")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <div key={s.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              Section {i + 1}
            </span>
            {sections.length > 1 && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDeleteSection(s.id)}
                disabled={pending}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </Button>
            )}
          </div>
          <TiptapEditor content={s.content} onSave={handleSave(s.id)} />
        </div>
      ))}

      <Button variant="outline" onClick={handleAddSection} disabled={pending}>
        <HugeiconsIcon icon={Add01Icon} size={16} className="mr-1" />
        Add section
      </Button>
    </div>
  )
}
