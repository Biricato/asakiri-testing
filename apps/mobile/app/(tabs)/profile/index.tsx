import { useState, useCallback } from "react"
import { View, Text, ScrollView, ActivityIndicator, Pressable } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "heroui-native"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { Logout01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useColors } from "@/lib/use-colors"

type Stats = {
  lessonsCompleted: number
  totalAttempts: number
  correctAttempts: number
  accuracy: number
  dueReviews: number
}

type Profile = {
  user: { id: string; name: string; email: string; role: string }
  stats: Stats
}

type EnrolledCourse = {
  courseId: string
  title: string
  targetLanguage: string
  sourceLanguage: string
}

export default function ProfileScreen() {
  const { signOut } = useAuth()
  const colors = useColors()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [loading, setLoading] = useState(true)

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api<Profile>("/api/v1/profile"),
        api<{ courses: EnrolledCourse[] }>("/api/v1/learn/enrolled"),
      ])
        .then(([p, c]) => {
          setProfile(p)
          setCourses(c.courses)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    }, []),
  )

  async function switchCourse(courseId: string) {
    await api("/api/v1/learn/active", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }).catch(() => {})
    router.push("/(tabs)/learn")
  }

  async function handleSignOut() {
    await signOut()
    router.replace("/(auth)/welcome")
  }

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text className="text-2xl font-bold text-foreground">{profile?.user.name}</Text>
        <Text className="text-sm text-muted-foreground">{profile?.user.email}</Text>

        {/* Stats */}
        <View className="mt-6 flex-row gap-3">
          <View className="flex-1 rounded-2xl bg-surface-secondary p-4">
            <Text className="text-2xl font-bold text-foreground">{profile?.stats.lessonsCompleted ?? 0}</Text>
            <Text className="text-xs text-muted-foreground">Lessons</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-surface-secondary p-4">
            <Text className="text-2xl font-bold text-foreground">{profile?.stats.accuracy ?? 0}%</Text>
            <Text className="text-xs text-muted-foreground">Accuracy</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-surface-secondary p-4">
            <Text className="text-2xl font-bold text-foreground">{profile?.stats.dueReviews ?? 0}</Text>
            <Text className="text-xs text-muted-foreground">Due</Text>
          </View>
        </View>

        {/* Course switcher */}
        <Text className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          My Courses
        </Text>
        <View className="gap-2">
          {courses.map((c) => (
            <Pressable
              key={c.courseId}
              onPress={() => switchCourse(c.courseId)}
              className="flex-row items-center justify-between rounded-2xl bg-surface-secondary px-4 py-3"
            >
              <View>
                <Text className="text-sm font-medium text-foreground">{c.title}</Text>
                <Text className="text-xs text-muted-foreground">
                  {c.sourceLanguage} → {c.targetLanguage}
                </Text>
              </View>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.muted} />
            </Pressable>
          ))}
          {courses.length === 0 && (
            <Text className="text-sm text-muted-foreground">No enrolled courses yet.</Text>
          )}
        </View>

        {/* Sign out */}
        <Button variant="outline" className="mt-8" onPress={handleSignOut}>
          <HugeiconsIcon icon={Logout01Icon} size={16} color={colors.foreground} />
          <Text>Sign out</Text>
        </Button>
      </ScrollView>
    </SafeAreaView>
  )
}
