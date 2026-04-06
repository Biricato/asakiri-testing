import { useState } from "react"
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { s, colors } from "@/lib/styles"

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
      await fetch("https://asakiri.com/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), redirectTo: "/reset-password" }),
      })
      setSent(true)
    } catch (e: any) {
      setError(e.message ?? "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={s.h1}>Check your email</Text>
          <Text style={[s.muted, { marginTop: 8, textAlign: "center" }]}>
            If an account exists for {email}, we sent a password reset link.
          </Text>
          <Link href="/(auth)/sign-in" style={{ marginTop: 24 }}>
            <Text style={s.link}>Back to sign in</Text>
          </Link>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}
      >
        <Text style={s.h1}>Forgot password</Text>
        <Text style={[s.muted, { marginBottom: 24 }]}>Enter your email to receive a reset link.</Text>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={{ gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor={colors.muted} />
          </View>
          <Pressable style={[s.buttonPrimary, loading && { opacity: 0.5 }]} onPress={handleSubmit} disabled={loading}>
            <Text style={s.buttonPrimaryText}>{loading ? "Sending..." : "Send reset link"}</Text>
          </Pressable>
        </View>

        <Link href="/(auth)/sign-in" style={{ marginTop: 24, alignSelf: "center" }}>
          <Text style={[s.muted, { textDecorationLine: "underline" }]}>Back to sign in</Text>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
