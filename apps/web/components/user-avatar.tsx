"use client"

import Avatar from "boring-avatars"

export function UserAvatar({
  name,
  size = 32,
}: {
  name: string
  size?: number
}) {
  return (
    <Avatar
      size={size}
      name={name}
      variant="beam"
      colors={["#017321", "#e6b313", "#264653", "#e76f51", "#2a9d8f"]}
    />
  )
}
