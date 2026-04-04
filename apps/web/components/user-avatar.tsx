"use client"

import { GradientAvatar } from "./gradient-avatar"

export function UserAvatar({
  name,
  size = 32,
}: {
  name: string
  size?: number
}) {
  return <GradientAvatar name={name} size={size} />
}
