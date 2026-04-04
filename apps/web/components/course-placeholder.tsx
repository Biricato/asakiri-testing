"use client"

import Avatar from "boring-avatars"

export function CoursePlaceholder({
  title,
  size = 200,
}: {
  title: string
  size?: number
}) {
  return (
    <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 via-warning/10 to-accent/5">
      <Avatar
        size={size}
        name={title}
        variant="marble"
        colors={["#017321", "#e6b313", "#264653", "#e76f51", "#2a9d8f"]}
        square
      />
    </div>
  )
}
