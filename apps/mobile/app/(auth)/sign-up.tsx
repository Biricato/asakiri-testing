import { useState } from "react"
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform } from "react-native"
import { Link, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAuth } from "@/lib/auth-context"
import { s, colors } from "@/lib/styles"

export default function SignUpScreen() {
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!name.trim() || !email.trim() || !password) return
    setError("")
    setLoading(true)
    try {
      await signUp(name.trim(), email.trim(), password)
      router.replace("/(tabs)/learn")
    } catch (e: any) {
      setError(e.message ?? "Failed to sign up")
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
        <Text style={s.h1}>Create account</Text>
        <Text style={[s.muted, { marginBottom: 24 }]}>Start learning or creating courses.</Text>

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={{ gap: 16 }}>
          <View style={{ gap: 6 }}>
            <Text style={s.label}>Display name</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} autoCapitalize="words" placeholder="Your name" placeholderTextColor={colors.muted} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={s.label}>Email</Text>
            <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoComplete="email" placeholder="you@example.com" placeholderTextColor={colors.muted} />
          </View>
          <View style={{ gap: 6 }}>
            <Text style={s.label}>Password</Text>
            <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry placeholder="Min 8 characters" placeholderTextColor={colors.muted} />
          </View>
          <Pressable style={[s.buttonPrimary, loading && { opacity: 0.5 }]} onPress={handleSubmit} disabled={loading}>
            <Text style={s.buttonPrimaryText}>{loading ? "Creating account..." : "Create account"}</Text>
          </Pressable>
        </View>

        <View style={{ marginTop: 24, flexDirection: "row", justifyContent: "center", gap: 4 }}>
          <Text style={s.muted}>Already have an account?</Text>
          <Link href="/(auth)/sign-in">
            <Text style={s.link}>Sign in</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
