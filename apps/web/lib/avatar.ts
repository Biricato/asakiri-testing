// Generate a consistent gradient from a name string
const gradients = [
  "from-rose-400 to-orange-300",
  "from-violet-400 to-purple-300",
  "from-blue-400 to-cyan-300",
  "from-emerald-400 to-teal-300",
  "from-amber-400 to-yellow-300",
  "from-pink-400 to-fuchsia-300",
  "from-sky-400 to-indigo-300",
  "from-lime-400 to-green-300",
]

export function avatarGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]!
}
