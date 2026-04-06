import { useState } from "react"
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { Link, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/lib/auth-context"
import { s, colors } from "@/lib/styles"

export default function SignInScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!email.trim() || !password) return
    setError("")
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      router.replace("/(tabs)/learn")
    } catch (e: any) {
      setError(e.message ?? "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}
      >
        <Text style={s.h1}>Welcome back</Text>
        <Text style={[s.muted, { marginBottom: 24 }]}>Sign in to continue learning.</Text>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={{ gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={s.label}>Email</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="you@example.com"
              placeholderTextColor={colors.muted}
            />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={s.label}>Password</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor={colors.muted}
            />
          </View>
          <Pressable
            style={[s.buttonPrimary, loading && { opacity: 0.5 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={s.buttonPrimaryText}>{loading ? "Signing in..." : "Sign in"}</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 24, flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text style={s.muted}>Don't have an account?</Text>
          <Link href="/(auth)/sign-up">
            <Text style={s.link}>Sign up</Text>
          </Link>
        </View>

        <Link href="/(auth)/forgot-password" style={{ marginTop: 12, alignSelf: "center" }}>
          <Text style={[s.muted, { textDecorationLine: "underline" }]}>Forgot password?</Text>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
