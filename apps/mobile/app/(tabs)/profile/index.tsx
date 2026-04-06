import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { Logout01Icon, ArrowRight01Icon, DiamondIcon, FireIcon, StarIcon, BookOpen02Icon, GridTableIcon, RepeatIcon } from "@hugeicons/core-free-icons"
import { api, getServerUrl } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useColors } from "@/lib/use-colors"
import { s } from "@/lib/styles"

type Gamification = {
  xp: number
  level: number
  gems: number
  streakCount: number
  streakFreezes: number
  longestStreak: number
  totalLessons: number
  totalExercises: number
  totalReviews: number
}

type Profile = {
  user: { id: string; name: string; email: string; role: string }
  stats: { lessonsCompleted: number; accuracy: number; dueReviews: number }
  gamification: Gamification
}

type EnrolledCourse = {
  courseId: string
  title: string
  targetLanguage: string
  sourceLanguage: string
}

type Achievement = {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  gemReward: number
  unlocked: boolean
}

export default function ProfileScreen() {
  const { signOut } = useAuth()
  const colors = useColors()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [courses, setCourses] = useState<EnrolledCourse[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingFreeze, setBuyingFreeze] = useState(false)

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        api<Profile>("/api/v1/profile"),
        api<{ courses: EnrolledCourse[] }>("/api/v1/learn/enrolled"),
        api<{ achievements: Achievement[] }>("/api/v1/gamification/achievements").catch(() => ({ achievements: [] })),
      ])
        .then(([p, c, a]) => {
          setProfile(p)
          setCourses(c.courses)
          setAchievements(a.achievements)
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

  async function handleBuyFreeze() {
    setBuyingFreeze(true)
    try {
      await api("/api/v1/gamification/buy-freeze", { method: "POST" })
      // Refresh profile
      const p = await api<Profile>("/api/v1/profile")
      setProfile(p)
    } catch {}
    setBuyingFreeze(false)
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

  const g = profile?.gamification

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Name + Level */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{profile?.user.name}</Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>{profile?.user.email}</Text>
          </View>
          <View style={{ backgroundColor: colors.primary, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#fff" }}>Lv.{g?.level ?? 1}</Text>
          </View>
        </View>

        {/* XP / Gems / Streak row */}
        <View style={{ marginTop: 20, flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: colors.surface, padding: 14, alignItems: "center" }}>
            <HugeiconsIcon icon={StarIcon} size={20} color="#f59e0b" />
            <Text style={{ marginTop: 4, fontSize: 18, fontWeight: "bold", color: colors.foreground }}>{g?.xp ?? 0}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>XP</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: colors.surface, padding: 14, alignItems: "center" }}>
            <HugeiconsIcon icon={DiamondIcon} size={20} color="#3b82f6" />
            <Text style={{ marginTop: 4, fontSize: 18, fontWeight: "bold", color: colors.foreground }}>{g?.gems ?? 0}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Gems</Text>
          </View>
          <View style={{ flex: 1, borderRadius: 16, backgroundColor: colors.surface, padding: 14, alignItems: "center" }}>
            <HugeiconsIcon icon={FireIcon} size={20} color="#ef4444" />
            <Text style={{ marginTop: 4, fontSize: 18, fontWeight: "bold", color: colors.foreground }}>{g?.streakCount ?? 0}</Text>
            <Text style={{ fontSize: 11, color: colors.muted }}>Streak</Text>
          </View>
        </View>

        {/* Streak details */}
        <View style={{ marginTop: 12, borderRadius: 16, backgroundColor: colors.surface, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
            <Text style={{ fontSize: 13, color: colors.muted }}>Longest streak</Text>
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>{g?.longestStreak ?? 0} days</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View>
              <Text style={{ fontSize: 13, color: colors.muted }}>Streak freezes</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>{g?.streakFreezes ?? 0}/2 owned</Text>
            </View>
            <Pressable
              onPress={handleBuyFreeze}
              disabled={buyingFreeze || (g?.streakFreezes ?? 0) >= 2}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                backgroundColor: (g?.streakFreezes ?? 0) >= 2 ? colors.border : "#3b82f6",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 6,
              }}
            >
              <HugeiconsIcon icon={DiamondIcon} size={14} color="#fff" />
              <Text style={{ fontSize: 12, fontWeight: "600", color: "#fff" }}>50</Text>
            </Pressable>
          </View>
        </View>

        {/* Activity stats */}
        <Text style={{ marginTop: 24, marginBottom: 8, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: colors.muted }}>
          Activity
        </Text>
        <View style={{ borderRadius: 16, backgroundColor: colors.surface, overflow: "hidden" }}>
          {[
            { label: "Lessons completed", value: g?.totalLessons ?? 0 },
            { label: "Exercises completed", value: g?.totalExercises ?? 0 },
            { label: "SRS reviews", value: g?.totalReviews ?? 0 },
            { label: "Accuracy", value: `${profile?.stats.accuracy ?? 0}%` },
          ].map((item, i, arr) => (
            <View key={item.label} style={{
              flexDirection: "row",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: i < arr.length - 1 ? 0.5 : 0,
              borderBottomColor: colors.border,
            }}>
              <Text style={{ fontSize: 14, color: colors.muted }}>{item.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Achievements */}
        {achievements.length > 0 && (
          <>
            <Text style={{ marginTop: 24, marginBottom: 8, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: colors.muted }}>
              Achievements
            </Text>
            <View style={{ gap: 8 }}>
              {achievements.map((a) => (
                <View key={a.id} style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  padding: 14,
                  opacity: a.unlocked ? 1 : 0.4,
                }}>
                  <View style={{
                    width: 40, height: 40, borderRadius: 20,
                    backgroundColor: a.unlocked ? colors.primary + "20" : colors.border,
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <HugeiconsIcon
                      icon={a.icon === "fire" ? FireIcon : a.icon === "book" ? BookOpen02Icon : a.icon === "grid" ? GridTableIcon : a.icon === "repeat" ? RepeatIcon : StarIcon}
                      size={20}
                      color={a.unlocked ? colors.primary : colors.muted}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{a.title}</Text>
                    <Text style={{ fontSize: 12, color: colors.muted }}>{a.description}</Text>
                  </View>
                  {a.unlocked && (
                    <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "600" }}>Unlocked</Text>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* Course switcher */}
        <Text style={{ marginTop: 24, marginBottom: 8, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: colors.muted }}>
          My Courses
        </Text>
        <View style={{ gap: 8 }}>
          {courses.map((c) => (
            <Pressable
              key={c.courseId}
              onPress={() => switchCourse(c.courseId)}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 16, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <View>
                <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>{c.title}</Text>
                <Text style={{ fontSize: 12, color: colors.muted }}>{c.sourceLanguage} → {c.targetLanguage}</Text>
              </View>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.muted} />
            </Pressable>
          ))}
          {courses.length === 0 && (
            <Text style={{ fontSize: 14, color: colors.muted }}>No enrolled courses yet.</Text>
          )}
        </View>

        {/* Server */}
        <View style={{ marginTop: 24, backgroundColor: colors.surface, borderRadius: 16, padding: 16 }}>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>Connected to</Text>
          <Text style={{ fontSize: 14, color: colors.foreground }}>{getServerUrl()}</Text>
        </View>

        {/* Sign out */}
        <Pressable
          style={[s.buttonOutline, { marginTop: 16, flexDirection: "row", justifyContent: "center", gap: 8 }]}
          onPress={handleSignOut}
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} color={colors.foreground} />
          <Text style={s.buttonOutlineText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}
