import { Slot } from "expo-router"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { HeroUINativeProvider } from "heroui-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "@/lib/auth-context"
import "@/global.css"

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <AuthProvider>
            <Slot />
          </AuthProvider>
          <StatusBar style="auto" />
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
