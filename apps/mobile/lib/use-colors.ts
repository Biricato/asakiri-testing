import { useColorScheme } from "react-native"

// HeroUI Native theme colors - matches the web design system
const light = {
  primary: "#17c964",
  foreground: "#11181c",
  muted: "#889096",
  background: "#ffffff",
  surface: "#f4f4f5",
  border: "#e4e4e7",
  danger: "#f31260",
  success: "#17c964",
  warning: "#f5a524",
}

const dark = {
  primary: "#17c964",
  foreground: "#ecedee",
  muted: "#889096",
  background: "#000000",
  surface: "#18181b",
  border: "#27272a",
  danger: "#f31260",
  success: "#17c964",
  warning: "#f5a524",
}

export function useColors() {
  const scheme = useColorScheme()
  return scheme === "dark" ? dark : light
}
