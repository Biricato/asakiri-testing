import { View, Text, Image, Pressable } from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { s, colors } from "@/lib/styles"

export default function WelcomeScreen() {
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
      </View>
    </SafeAreaView>
  )
}
