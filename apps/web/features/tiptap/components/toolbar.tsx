"use client"

import { useRef } from "react"
import type { Editor } from "@tiptap/react"
import { Button } from "@workspace/ui/components/button"
import { Separator } from "@workspace/ui/components/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  TextBoldIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextStrikethroughIcon,
  Heading01Icon,
  Heading02Icon,
  Heading03Icon,
  LeftToRightListBulletIcon,
  LeftToRightListNumberIcon,
  QuoteDownIcon,
  Link01Icon,
  Image01Icon,
  MusicNote01Icon,
  GridTableIcon,
  PlayIcon,
  SourceCodeIcon,
} from "@hugeicons/core-free-icons"

function ToolbarButton({
  icon,
  isActive = false,
  onClick,
  title,
  disabled = false,
}: {
  icon: typeof TextBoldIcon
  isActive?: boolean
  onClick: () => void
  title: string
  disabled?: boolean
}) {
  return (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      size="icon-sm"
      onClick={onClick}
      title={title}
      disabled={disabled}
      type="button"
    >
      <HugeiconsIcon icon={icon} size={16} strokeWidth={2} />
    </Button>
  )
}

export function Toolbar({ editor }: { editor: Editor | null }) {
  const imageInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)

  if (!editor) return null

  async function uploadFile(file: File): Promise<string | null> {
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (!res.ok) return null
    const data = await res.json()
    return data.url
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const url = await uploadFile(file)
    if (url) editor.chain().focus().setImage({ src: url }).run()
    e.target.value = ""
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    const url = await uploadFile(file)
    if (url) (editor.chain().focus() as ReturnType<typeof editor.chain>).setAudio({ src: url, title: file.name }).run()
    e.target.value = ""
  }

  function insertLink() {
    const url = window.prompt("Enter URL")
    if (!url || !editor) return
    editor.chain().focus().setLink({ href: url }).run()
  }

  function insertYouTube() {
    const url = window.prompt("Enter YouTube URL")
    if (!url || !editor) return
    editor.commands.setYoutubeVideo({ src: url })
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b p-1">
      <ToolbarButton icon={TextBoldIcon} isActive={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold" />
      <ToolbarButton icon={TextItalicIcon} isActive={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic" />
      <ToolbarButton icon={TextUnderlineIcon} isActive={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline" />
      <ToolbarButton icon={TextStrikethroughIcon} isActive={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough" />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton icon={Heading01Icon} isActive={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1" />
      <ToolbarButton icon={Heading02Icon} isActive={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2" />
      <ToolbarButton icon={Heading03Icon} isActive={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3" />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton icon={LeftToRightListBulletIcon} isActive={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list" />
      <ToolbarButton icon={LeftToRightListNumberIcon} isActive={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered list" />
      <ToolbarButton icon={QuoteDownIcon} isActive={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote" />
      <ToolbarButton icon={SourceCodeIcon} isActive={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block" />

      <Separator orientation="vertical" className="mx-1 h-6" />

      <ToolbarButton icon={Link01Icon} isActive={editor.isActive("link")} onClick={insertLink} title="Link" />
      <ToolbarButton icon={Image01Icon} onClick={() => imageInputRef.current?.click()} title="Image" />
      <ToolbarButton icon={MusicNote01Icon} onClick={() => audioInputRef.current?.click()} title="Audio" />
      <ToolbarButton icon={GridTableIcon} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Table" />
      <ToolbarButton icon={PlayIcon} onClick={insertYouTube} title="YouTube" />

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
    </div>
  )
}
