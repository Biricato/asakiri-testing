import { View, Text, Image } from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "heroui-native"

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 items-center justify-center px-6">
        <Image
          source={require("../../assets/icon.png")}
          className="mb-6 h-20 w-20"
          resizeMode="contain"
        />
        <Text className="text-3xl font-bold text-foreground">Asakiri</Text>
        <Text className="mt-2 text-center text-base text-muted-foreground">
          Master languages through interactive courses built by expert teachers
        </Text>

        <View className="mt-10 w-full gap-3">
          <Link href="/(auth)/sign-in" asChild>
            <Button size="lg">Sign in</Button>
          </Link>
          <Link href="/(auth)/sign-up" asChild>
            <Button variant="outline" size="lg">Create account</Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  )
}
