"use client"

import { useRef, useState } from "react"
import { Button } from "@heroui/react"

export function ImageUpload({
  name,
  value,
  accept,
  label,
}: {
  name: string
  value: string
  accept: string
  label: string
}) {
  const [url, setUrl] = useState(value)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: formData })
    if (res.ok) {
      const data = await res.json()
      setUrl(data.url)
    }
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={url} />
      {url && (
        <img src={url} alt={label} className="size-10 rounded-lg border border-border object-contain" />
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          isDisabled={uploading}
          onPress={() => inputRef.current?.click()}
        >
          {uploading ? "Uploading..." : url ? "Change" : "Upload"}
        </Button>
        {url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onPress={() => setUrl("")}
          >
            Remove
          </Button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />
    </div>
  )
}
