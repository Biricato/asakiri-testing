"use client"

import { useId } from "react"

const COLORS = ["#017321", "#e6b313", "#264653", "#e76f51", "#2a9d8f"]
const SIZE = 80

function hashCode(name: string): number {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

function getUnit(number: number, range: number, index?: number) {
  const value = number % range
  return index !== undefined && Math.floor(number / Math.pow(10, index)) % 2 === 0
    ? -value
    : value
}

function getColor(number: number, colors: string[], range: number) {
  return colors[number % range]!
}

function generateColors(name: string, colors: string[]) {
  const numFromName = hashCode(name)
  const range = colors.length
  return Array.from({ length: 3 }, (_, i) => ({
    color: getColor(numFromName + i, colors, range),
    translateX: getUnit(numFromName * (i + 1), SIZE / 10, 1),
    translateY: getUnit(numFromName * (i + 1), SIZE / 10, 2),
    scale: 1.2 + getUnit(numFromName * (i + 1), SIZE / 20) / 10,
    rotate: getUnit(numFromName * (i + 1), 360, 1),
  }))
}

/**
 * Marble-style gradient avatar based on boring-avatars.
 * Circle by default, square with `square` prop.
 */
export function GradientAvatar({
  name,
  size = 40,
  square = false,
  className,
  ...props
}: {
  name: string
  size?: number | string
  square?: boolean
  className?: string
} & React.SVGProps<SVGSVGElement>) {
  const data = generateColors(name, COLORS)
  const maskId = useId()
  const filterId = useId()

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
      {...props}
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={SIZE} height={SIZE}>
        <rect width={SIZE} height={SIZE} rx={square ? undefined : SIZE * 2} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width={SIZE} height={SIZE} fill={data[0]!.color} />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill={data[1]!.color}
          transform={`translate(${data[1]!.translateX} ${data[1]!.translateY}) rotate(${data[1]!.rotate} ${SIZE / 2} ${SIZE / 2}) scale(${data[2]!.scale})`}
        />
        <path
          filter={`url(#${filterId})`}
          style={{ mixBlendMode: "overlay" }}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill={data[2]!.color}
          transform={`translate(${data[2]!.translateX} ${data[2]!.translateY}) rotate(${data[2]!.rotate} ${SIZE / 2} ${SIZE / 2}) scale(${data[2]!.scale})`}
        />
      </g>
      <defs>
        <filter
          id={filterId}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={7} result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  )
}

/** Course placeholder — marble gradient at 4:3 aspect ratio */
export function CoursePlaceholder({ title }: { title: string }) {
  const data = generateColors(title, COLORS)
  const maskId = `cp-m-${hashCode(title)}`
  const filterId = `cp-f-${hashCode(title)}`
  const W = 120
  const H = 90

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      className="aspect-[4/3] w-full rounded-2xl"
      preserveAspectRatio="xMidYMid slice"
    >
      <mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
        <rect width={W} height={H} fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width={W} height={H} fill={data[0]!.color} />
        <path
          filter={`url(#${filterId})`}
          d="M32.414 59.35L50.376 70.5H72.5v-71H33.728L26.5 13.381l19.057 27.08L32.414 59.35z"
          fill={data[1]!.color}
          transform={`translate(${data[1]!.translateX + 20} ${data[1]!.translateY + 5}) rotate(${data[1]!.rotate} ${W / 2} ${H / 2}) scale(${data[2]!.scale * 1.3})`}
        />
        <path
          filter={`url(#${filterId})`}
          style={{ mixBlendMode: "overlay" }}
          d="M22.216 24L0 46.75l14.108 38.129L78 86l-3.081-59.276-22.378 4.005 12.972 20.186-23.35 27.395L22.215 24z"
          fill={data[2]!.color}
          transform={`translate(${data[2]!.translateX + 20} ${data[2]!.translateY}) rotate(${data[2]!.rotate} ${W / 2} ${H / 2}) scale(${data[2]!.scale * 1.3})`}
        />
      </g>
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={10} result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  )
}
