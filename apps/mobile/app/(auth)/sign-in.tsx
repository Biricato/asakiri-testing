import { useState } from "react"
import { View, Text, KeyboardAvoidingView, Platform } from "react-native"
import { Link, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button, TextField } from "heroui-native"
import { useAuth } from "@/lib/auth-context"

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
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <Text className="mb-2 text-2xl font-bold text-foreground">Welcome back</Text>
        <Text className="mb-6 text-base text-muted-foreground">Sign in to continue learning.</Text>

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
            autoComplete="email"
          />
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button onPress={handleSubmit} isDisabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Don't have an account?</Text>
          <Link href="/(auth)/sign-up">
            <Text className="text-sm font-medium text-foreground underline">Sign up</Text>
          </Link>
        </View>

        <Link href="/(auth)/forgot-password" className="mt-3 self-center">
          <Text className="text-sm text-muted-foreground underline">Forgot password?</Text>
        </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
