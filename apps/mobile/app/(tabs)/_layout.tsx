import { Tabs, Redirect } from "expo-router"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { BookOpen02Icon, RepeatIcon, Compass01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { useAuth } from "@/lib/auth-context"
import { useColors } from "@/lib/use-colors"
import { ActivityIndicator, View } from "@/tw"

export default function TabLayout() {
  const { user, loading } = useAuth()
  const colors = useColors()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!user) return <Redirect href="/(auth)/welcome" />

  const screenOptions = {
    headerShown: false as const,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { paddingBottom: 4, height: 56, backgroundColor: colors.background, borderTopColor: colors.border },
    tabBarLabelStyle: { fontSize: 11, fontWeight: "600" as const },
  }

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={BookOpen02Icon} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: "Practice",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={RepeatIcon} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={Compass01Icon} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <HugeiconsIcon icon={UserIcon} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
