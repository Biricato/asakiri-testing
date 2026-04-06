import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { Logout01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useColors } from "@/lib/use-colors"
import { s, colors as staticColors } from "@/lib/styles"

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
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{profile?.user.name}</Text>
        <Text style={{ fontSize: 14, color: colors.muted }}>{profile?.user.email}</Text>

        {/* Stats */}
        <View style={{ marginTop: 24, flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: colors.surface, padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{profile?.stats.lessonsCompleted ?? 0}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Lessons</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: colors.surface, padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{profile?.stats.accuracy ?? 0}%</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Accuracy</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: colors.surface, padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{profile?.stats.dueReviews ?? 0}</Text>
            <Text style={{ fontSize: 12, color: colors.muted }}>Due</Text>
          </View>
        </View>

        {/* Course switcher */}
        <Text style={{ marginBottom: 8, marginTop: 24, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: colors.muted }}>
          My Courses
        </Text>
        <View style={{ gap: 8 }}>
          {courses.map((c) => (
            <Pressable
              key={c.courseId}
              onPress={() => switchCourse(c.courseId)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 16,
                backgroundColor: colors.surface,
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>{c.title}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>
                  {c.sourceLanguage} → {c.targetLanguage}
                </Text>
              </View>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.muted} />
            </Pressable>
          ))}
          {courses.length === 0 && (
            <Text style={{ fontSize: 14, color: colors.muted }}>No enrolled courses yet.</Text>
          )}
        </View>

        {/* Sign out */}
        <Pressable
          style={[s.buttonOutline, { marginTop: 32, flexDirection: "row", justifyContent: "center", gap: 8 }]}
          onPress={handleSignOut}
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} color={colors.foreground} />
          <Text style={s.buttonOutlineText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
