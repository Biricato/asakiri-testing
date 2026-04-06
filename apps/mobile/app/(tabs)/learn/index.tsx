import { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "heroui-native"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { BookOpen02Icon, GridTableIcon, CheckmarkCircle02Icon, SquareLock02Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"

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

  const loadPath = useCallback(async () => {
    try {
      const data = await api<{ active: ActiveCourse | null }>("/api/v1/learn/active")
      setActive(data.active)
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
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (!active) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <HugeiconsIcon icon={BookOpen02Icon} size={48} color={colors.muted} />
          <Text className="mt-4 text-lg font-semibold text-foreground">No active course</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Pick a course to start your learning journey.
          </Text>
          <Button className="mt-6" onPress={() => router.push("/(tabs)/explore")}>
            Browse courses
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="border-b border-border px-4 py-3">
        <Text className="text-lg font-bold text-foreground">{active.title}</Text>
        <Text className="text-xs text-muted-foreground">
          {active.sourceLanguage} → {active.targetLanguage}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
        {active.path.map((unit) => (
          <View key={unit.id} className="mb-6">
            <Text className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {unit.title}
            </Text>
            <View className="items-center gap-3">
              {unit.nodes.map((node) => {
                const isLesson = node.type === "lesson"
                const isLocked = !!node.patreonTier

                return (
                  <Pressable
                    key={node.id}
                    onPress={() => {
                      if (isLocked) return
                      if (isLesson && node.lessonId) {
                        router.push(`/(tabs)/learn/lesson/${node.lessonId}`)
                      } else if (node.exerciseGroupId) {
                        router.push(`/(tabs)/learn/exercise/${node.exerciseGroupId}`)
                      }
                    }}
                    className="w-full flex-row items-center gap-3 rounded-2xl bg-surface-secondary px-4 py-3"
                    style={{ opacity: isLocked ? 0.5 : 1 }}
                  >
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full ${
                        node.completed
                          ? "bg-success/20"
                          : isLesson
                            ? "bg-primary/20"
                            : "bg-warning/20"
                      }`}
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
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-foreground">{node.title}</Text>
                      {isLocked && (
                        <Text className="text-xs text-muted-foreground">{node.patreonTier} tier</Text>
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
