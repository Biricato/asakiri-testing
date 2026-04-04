"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@heroui/react"
import { Button } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Delete02Icon } from "@hugeicons/core-free-icons"
import { TiptapEditor } from "@/features/tiptap/components/editor"
import { saveContent, createSection, deleteSection, updateSectionTitle } from "../actions/sections"
import { updateLesson } from "../actions/lessons"
import type { Section } from "../types"

export function SectionEditor({
  lessonId,
  lessonTitle,
  sections,
}: {
  lessonId: string
  lessonTitle: string
  sections: Section[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState(lessonTitle)

  const handleSave = useCallback(
    (sectionId: string) => (content: unknown) => {
      saveContent(sectionId, content)
    },
    [],
  )

  function handleLessonTitleBlur() {
    if (title.trim() && title !== lessonTitle) {
      updateLesson(lessonId, { title: title.trim() })
    }
  }

  function handleSectionTitleBlur(sectionId: string, newTitle: string, oldTitle: string | null) {
    if (newTitle !== (oldTitle ?? "")) {
      updateSectionTitle(sectionId, newTitle)
    }
  }

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
      {/* Editable lesson title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleLessonTitleBlur}
        className="w-full bg-transparent text-2xl font-bold outline-none placeholder:text-muted"
        placeholder="Lesson title..."
      />

      <p className="text-muted text-sm">Changes are saved automatically.</p>

      {sections.map((s) => (
        <div key={s.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <SectionTitle sectionId={s.id} title={s.title} onBlur={handleSectionTitleBlur} />
            {sections.length > 1 && (
              <Button
                variant="ghost"
                isIconOnly
                size="sm"
                onPress={() => handleDeleteSection(s.id)}
                isDisabled={pending}
              >
                <HugeiconsIcon icon={Delete02Icon} size={14} />
              </Button>
            )}
          </div>
          <TiptapEditor content={s.content} onSave={handleSave(s.id)} />
        </div>
      ))}

      <Button variant="outline" onPress={handleAddSection} isDisabled={pending}>
        <HugeiconsIcon icon={Add01Icon} size={16} />
        Add section
      </Button>
    </div>
  )
}

function SectionTitle({
  sectionId,
  title,
  onBlur,
}: {
  sectionId: string
  title: string | null
  onBlur: (id: string, newTitle: string, oldTitle: string | null) => void
}) {
  const [value, setValue] = useState(title ?? "")

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onBlur(sectionId, value, title)}
      className="bg-transparent text-sm font-medium outline-none placeholder:text-muted"
      placeholder="Section title..."
    />
  )
}
