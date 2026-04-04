import { GestureHandlerRootView } from "react-native-gesture-handler"
import { HeroUINativeProvider } from "heroui-native"
import { StatusBar } from "expo-status-bar"
import { View, Text } from "react-native"
import { Button } from "heroui-native"
import "./global.css"

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
          }}
        >
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Asakiri</Text>
          <Text style={{ color: "#888" }}>Language Learning Platform</Text>
          <Button onPress={() => console.log("Pressed!")}>Get started</Button>
        </View>
        <StatusBar style="auto" />
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  )
}
