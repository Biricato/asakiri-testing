import { StyleSheet } from "react-native"

export const colors = {
  primary: "#17c964",
  foreground: "#11181c",
  muted: "#889096",
  background: "#ffffff",
  surface: "#f4f4f5",
  border: "#e4e4e7",
  danger: "#f31260",
  success: "#17c964",
  warning: "#f5a524",
  white: "#ffffff",
}

export const s = StyleSheet.create({
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.foreground,
    marginBottom: 4,
  },
  h2: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.foreground,
  },
  h3: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
  body: {
    fontSize: 14,
    color: colors.foreground,
  },
  muted: {
    fontSize: 14,
    color: colors.muted,
  },
  mutedSm: {
    fontSize: 12,
    color: colors.muted,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
  },
  link: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.foreground,
    textDecorationLine: "underline",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.foreground,
    backgroundColor: colors.background,
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  buttonPrimaryText: {
    color: colors.white,
    fontWeight: "600" as const,
    fontSize: 14,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center" as const,
  },
  buttonOutlineText: {
    fontWeight: "600" as const,
    fontSize: 14,
    color: colors.foreground,
  },
  buttonGhost: {
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center" as const,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 16,
  },
  errorBox: {
    backgroundColor: "rgba(243, 18, 96, 0.1)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: colors.danger,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 12,
    color: colors.muted,
    textTransform: "capitalize" as const,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
})
