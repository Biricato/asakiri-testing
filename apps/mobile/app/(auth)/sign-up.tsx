import { useState } from "react"
import { View, Text, KeyboardAvoidingView, Platform } from "react-native"
import { Link, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button, TextField } from "heroui-native"
import { useAuth } from "@/lib/auth-context"

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
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <Text className="mb-2 text-2xl font-bold text-foreground">Create account</Text>
        <Text className="mb-6 text-base text-muted-foreground">Start learning or creating courses.</Text>

        {error ? (
          <View className="mb-4 rounded-xl bg-danger/10 px-4 py-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        ) : null}

        <View className="gap-4">
          <TextField
            label="Display name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
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
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </View>

        <View className="mt-6 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Already have an account?</Text>
          <Link href="/(auth)/sign-in">
            <Text className="text-sm font-medium text-foreground underline">Sign in</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
