import { View, Text, Pressable, TextInput, type PressableProps, type TextInputProps } from "@/tw"
import { useColors } from "@/lib/use-colors"

type ButtonProps = PressableProps & {
  variant?: "primary" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  isDisabled?: boolean
  isIconOnly?: boolean
  children: React.ReactNode
}

export function Button({
  variant = "primary",
  size = "md",
  isDisabled,
  isIconOnly,
  children,
  className,
  ...props
}: ButtonProps & { className?: string }) {
  const colors = useColors()

  const base = "flex-row items-center justify-center rounded-xl"
  const sizeClass = isIconOnly
    ? size === "sm" ? "h-8 w-8" : "h-10 w-10"
    : size === "sm" ? "px-3 py-1.5" : size === "lg" ? "px-6 py-3" : "px-4 py-2.5"

  const variantClass =
    variant === "outline"
      ? "border border-border"
      : variant === "ghost"
        ? ""
        : "bg-primary"

  return (
    <Pressable
      disabled={isDisabled}
      className={`${base} ${sizeClass} ${variantClass} ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={`font-semibold ${
            size === "sm" ? "text-sm" : size === "lg" ? "text-base" : "text-sm"
          } ${variant === "primary" ? "text-white" : "text-foreground"}`}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  )
}

type InputProps = TextInputProps & {
  label?: string
}

export function Input({ label, className, ...props }: InputProps) {
  const colors = useColors()

  return (
    <View className="gap-1.5">
      {label && <Text className="text-sm font-medium text-foreground">{label}</Text>}
      <TextInput
        placeholderTextColor={colors.muted}
        className={`rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground ${className ?? ""}`}
        {...props}
      />
    </View>
  )
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View className={`rounded-full border border-border px-2.5 py-0.5 ${className ?? ""}`}>
      {typeof children === "string" ? (
        <Text className="text-xs text-muted-foreground capitalize">{children}</Text>
      ) : (
        children
      )}
    </View>
  )
}
