import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import {
  BookOpen02Icon,
  GridTableIcon,
  CheckmarkCircle02Icon,
  SquareLock02Icon,
  ArrowRight01Icon,
  FireIcon,
  DiamondIcon,
} from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"
import { s, colors as staticColors } from "@/lib/styles"

type PathNode = {
  id: string
  type: string
  lessonId: string | null
  exerciseGroupId: string | null
  order: number
  title: string
  completed: boolean
  patreonTier: string | null
}

type PathUnit = {
  id: string
  title: string
  order: number
  nodes: PathNode[]
}

type ActiveCourse = {
  courseId: string
  title: string
  targetLanguage: string
  sourceLanguage: string
  difficulty: string
  coverImageUrl: string | null
  path: PathUnit[]
}

export default function LearnScreen() {
  const colors = useColors()
  const [active, setActive] = useState<ActiveCourse | null>(null)
  const [loading, setLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [gems, setGems] = useState(0)

  const loadPath = useCallback(async () => {
    try {
      const [pathData, statsData] = await Promise.all([
        api<{ active: ActiveCourse | null }>("/api/v1/learn/active"),
        api<{ stats: { streakCount: number; gems: number } }>("/api/v1/gamification/stats").catch(() => ({ stats: { streakCount: 0, gems: 0 } })),
      ])
      setActive(pathData.active)
      setStreak(statsData.stats.streakCount)
      setGems(statsData.stats.gems)
    } catch {
      setActive(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadPath()
    }, [loadPath]),
  )

  if (loading) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  if (!active) {
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <HugeiconsIcon icon={BookOpen02Icon} size={48} color={colors.muted} />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: "600", color: colors.foreground }}>
            No active course
          </Text>
          <Text style={{ marginTop: 4, textAlign: "center", fontSize: 14, color: colors.muted }}>
            Pick a course to start your learning journey.
          </Text>
          <Pressable
            style={[s.buttonPrimary, { marginTop: 24, paddingHorizontal: 24 }]}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Text style={s.buttonPrimaryText}>Browse courses</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }} numberOfLines={1}>{active.title}</Text>
          <Text style={{ fontSize: 12, color: colors.muted }}>
            {active.sourceLanguage} → {active.targetLanguage}
          </Text>
        </View>
        <View style={{ flexDirection: "row", gap: 12, alignItems: "center", flexShrink: 0 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <HugeiconsIcon icon={FireIcon} size={18} color={streak > 0 ? "#ef4444" : colors.muted} />
            <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground }}>{streak}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <HugeiconsIcon icon={DiamondIcon} size={18} color="#3b82f6" />
            <Text style={{ fontSize: 14, fontWeight: "bold", color: colors.foreground }}>{gems}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {active.path.map((unit) => (
          <View key={unit.id} style={{ marginBottom: 24 }}>
            <Text style={{ marginBottom: 12, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1, color: colors.muted }}>
              {unit.title}
            </Text>
            <View style={{ alignItems: "center", gap: 12 }}>
              {unit.nodes.map((node) => {
                const isLesson = node.type === "lesson"
                const isLocked = !!node.patreonTier

                const iconBg = node.completed
                  ? `${colors.success}20`
                  : isLesson
                    ? `${colors.primary}20`
                    : `${colors.warning}20`

                return (
                  <Pressable
                    key={node.id}
                    onPress={() => {
                      if (isLocked) return
                      if (isLesson && node.lessonId) {
                        router.push(`/lesson/${node.lessonId}`)
                      } else if (node.exerciseGroupId) {
                        router.push(`/exercise/${node.exerciseGroupId}`)
                      }
                    }}
                    style={{
                      width: "100%",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderRadius: 16,
                      backgroundColor: colors.surface,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      opacity: isLocked ? 0.5 : 1,
                    }}
                  >
                    <View
                      style={{
                        height: 40,
                        width: 40,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 20,
                        backgroundColor: iconBg,
                      }}
                    >
                      {node.completed ? (
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color={colors.success} />
                      ) : isLocked ? (
                        <HugeiconsIcon icon={SquareLock02Icon} size={18} color={colors.muted} />
                      ) : isLesson ? (
                        <HugeiconsIcon icon={BookOpen02Icon} size={18} color={colors.primary} />
                      ) : (
                        <HugeiconsIcon icon={GridTableIcon} size={18} color={colors.warning} />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>{node.title}</Text>
                      {isLocked && (
                        <Text style={{ fontSize: 12, color: colors.muted }}>{node.patreonTier} tier</Text>
                      )}
                    </View>
                    {!isLocked && !node.completed && (
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} color={colors.muted} />
                    )}
                  </Pressable>
                )
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}
