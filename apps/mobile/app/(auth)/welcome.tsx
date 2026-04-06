import { useState } from "react"
import { View, Text, Image, Pressable, TextInput } from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { s, colors } from "@/lib/styles"
import { getServerUrl, setServerUrl } from "@/lib/api"

export default function WelcomeScreen() {
  const [showServer, setShowServer] = useState(false)
  const [serverInput, setServerInput] = useState(getServerUrl())
  const [saved, setSaved] = useState(false)

  async function handleSaveServer() {
    await setServerUrl(serverInput)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
        <Image
          source={require("../../assets/icon.png")}
          style={{ width: 80, height: 80, marginBottom: 24 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.foreground }}>Asakiri</Text>
        <Text style={[s.muted, { marginTop: 8, textAlign: "center", fontSize: 16 }]}>
          Master languages through interactive courses
        </Text>

        <View style={{ marginTop: 40, width: "100%", gap: 12 }}>
          <Link href="/(auth)/sign-in" asChild>
            <Pressable style={s.buttonPrimary}>
              <Text style={[s.buttonPrimaryText, { fontSize: 16 }]}>Sign in</Text>
            </Pressable>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <Pressable style={s.buttonOutline}>
              <Text style={[s.buttonOutlineText, { fontSize: 16 }]}>Create account</Text>
            </Pressable>
          </Link>
        </View>

        {/* Server URL */}
        <Pressable onPress={() => setShowServer(!showServer)} style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 13, color: colors.muted }}>
            {showServer ? "Hide server settings" : "Connect to a different server"}
          </Text>
        </Pressable>

        {showServer && (
          <View style={{ marginTop: 12, width: "100%", gap: 8 }}>
            <Text style={[s.label, { fontSize: 12 }]}>Server URL</Text>
            <TextInput
              style={[s.input, { fontSize: 14 }]}
              value={serverInput}
              onChangeText={setServerInput}
              placeholder="https://your-asakiri-instance.com"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
            <Pressable style={s.buttonOutline} onPress={handleSaveServer}>
              <Text style={s.buttonOutlineText}>{saved ? "Saved!" : "Save"}</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  )
}
