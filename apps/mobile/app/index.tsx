import { Redirect } from "expo-router"
import { ActivityIndicator, View } from "react-native"
import { useAuth } from "@/lib/auth-context"

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!user) return <Redirect href="/(auth)/welcome" />
  return <Redirect href="/(tabs)/learn" />
}
