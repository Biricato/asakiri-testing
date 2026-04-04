"use client"

import { useEffect, useRef, useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableCell from "@tiptap/extension-table-cell"
import TableHeader from "@tiptap/extension-table-header"
import Underline from "@tiptap/extension-underline"
import Youtube from "@tiptap/extension-youtube"
import Placeholder from "@tiptap/extension-placeholder"
import { AudioExtension } from "../extensions/audio"
import { Toolbar } from "./toolbar"

export function TiptapEditor({
  content,
  onSave,
}: {
  content: unknown
  onSave: (content: unknown) => void
}) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSave = useCallback(
    (json: unknown) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSave(json)
      }, 500)
    },
    [onSave],
  )

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: false }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Underline,
      Youtube.configure({ width: 640, height: 360 }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      AudioExtension,
    ],
    content: (content as Record<string, unknown>) ?? undefined,
    onUpdate: ({ editor }) => {
      handleSave(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none p-4 outline-none min-h-[300px]",
      },
    },
  })

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="rounded-md border">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  )
}
