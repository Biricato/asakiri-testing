import { useState } from "react"
import { View, Text, KeyboardAvoidingView, Platform } from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button, TextField } from "heroui-native"
import { api } from "@/lib/api"

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit() {
    if (!email.trim()) return
    setError("")
    setLoading(true)
    try {
      await fetch(
        `${__DEV__ ? "http://localhost:3000" : "https://asakiri.com"}/api/auth/request-password-reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), redirectTo: "/reset-password" }),
        },
      )
      setSent(true)
    } catch (e: any) {
      setError(e.message ?? "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-2xl font-bold text-foreground">Check your email</Text>
          <Text className="mt-2 text-center text-base text-muted-foreground">
            If an account exists for {email}, we sent a password reset link.
          </Text>
          <Link href="/(auth)/sign-in" className="mt-6">
            <Text className="text-sm font-medium text-foreground underline">Back to sign in</Text>
          </Link>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <Text className="mb-2 text-2xl font-bold text-foreground">Forgot password</Text>
        <Text className="mb-6 text-base text-muted-foreground">Enter your email to receive a reset link.</Text>

        {error ? (
          <View className="mb-4 rounded-xl bg-danger/10 px-4 py-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        <View className="gap-4">
          <TextField
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Button onPress={handleSubmit} isDisabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </Button>
        </View>

        <Link href="/(auth)/sign-in" className="mt-6 self-center">
          <Text className="text-sm text-muted-foreground underline">Back to sign in</Text>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
