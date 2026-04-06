import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { RepeatIcon, CheckmarkCircle02Icon, Time01Icon, Calendar01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"
import { s } from "@/lib/styles"

type DueItem = {
  variantId: string
  type: string
  prompt: any
  solution: any
}

type Summary = {
  total: number
  dueNow: number
  dueNextHour: number
  dueNextDay: number
  stages: {
    apprentice: number
    guru: number
    master: number
    enlightened: number
    burned: number
  }
}

function toText(value: any): string {
  if (!value) return ""
  if (typeof value === "string") return value
  if (value.stem) return value.stem
  if (value.clozeText) return value.clozeText
  if (value.text) return value.text
  if (value.prompt) return value.prompt
  if (value.correctAnswer) return value.correctAnswer
  return JSON.stringify(value)
}

const stageColors = {
  apprentice: "#f472b6",
  guru: "#a78bfa",
  master: "#60a5fa",
  enlightened: "#34d399",
  burned: "#fbbf24",
}

export default function PracticeScreen() {
  const colors = useColors()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [items, setItems] = useState<DueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState(false)
  const [current, setCurrent] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [done, setDone] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [summaryData, dueData] = await Promise.all([
        api<Summary>("/api/v1/srs/summary"),
        api<{ items: DueItem[] }>("/api/v1/srs/due"),
      ])
      setSummary(summaryData)
      setItems(dueData.items)
    } catch {
      setSummary(null)
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      if (!reviewing) loadData()
    }, [loadData, reviewing]),
  )

  function startReview() {
    setCurrent(0)
    setShowAnswer(false)
    setDone(false)
    setSessionStats({ correct: 0, total: 0 })
    setReviewing(true)
  }

  async function handleReview(quality: number) {
    const item = items[current]
    if (!item) return

    setSessionStats((s) => ({
      correct: s.correct + (quality >= 3 ? 1 : 0),
      total: s.total + 1,
    }))

    await api("/api/v1/srs/review", {
      method: "POST",
      body: JSON.stringify({ variantId: item.variantId, quality }),
    }).catch(() => {})

    if (current + 1 >= items.length) {
      setDone(true)
    } else {
      setCurrent(current + 1)
      setShowAnswer(false)
    }
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

  // Review complete screen
  if (reviewing && done) {
    const pct = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={56} color={colors.success} />
          <Text style={{ marginTop: 16, fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            {pct}%
          </Text>
          <Text style={{ marginTop: 4, fontSize: 16, color: colors.muted }}>
            {sessionStats.correct} of {sessionStats.total} correct
          </Text>
          <Pressable
            style={[s.buttonPrimary, { marginTop: 32, paddingHorizontal: 32 }]}
            onPress={() => { setReviewing(false); loadData() }}
          >
            <Text style={s.buttonPrimaryText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // Active review screen
  if (reviewing && items.length > 0) {
    const item = items[current]!
    return (
      <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: colors.border }}>
          <View style={{ height: 4, backgroundColor: colors.primary, width: `${((current) / items.length) * 100}%` }} />
        </View>

        <View style={{ paddingHorizontal: 16, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between" }}>
          <Pressable onPress={() => setReviewing(false)}>
            <Text style={{ fontSize: 14, color: colors.muted }}>Exit</Text>
          </Pressable>
          <Text style={{ fontSize: 14, color: colors.muted }}>{current + 1} / {items.length}</Text>
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ textAlign: "center", fontSize: 28, fontWeight: "bold", color: colors.foreground }}>
            {toText(item.prompt)}
          </Text>

          {showAnswer && (
            <View style={{ marginTop: 24, borderRadius: 16, backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 16, width: "100%" }}>
              <Text style={{ textAlign: "center", fontSize: 20, color: colors.foreground }}>
                {toText(item.solution)}
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          {!showAnswer ? (
            <Pressable style={s.buttonPrimary} onPress={() => setShowAnswer(true)}>
              <Text style={s.buttonPrimaryText}>Show Answer</Text>
            </Pressable>
          ) : (
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable
                style={{ flex: 1, backgroundColor: "#ef4444", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
                onPress={() => handleReview(1)}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Again</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1 }}>&lt;1m</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, backgroundColor: "#f59e0b", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
                onPress={() => handleReview(2)}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Hard</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1 }}>10m</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
                onPress={() => handleReview(3)}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Good</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1 }}>1d</Text>
              </Pressable>
              <Pressable
                style={{ flex: 1, backgroundColor: "#3b82f6", borderRadius: 12, paddingVertical: 14, alignItems: "center" }}
                onPress={() => handleReview(5)}
              >
                <Text style={{ color: "#fff", fontWeight: "600", fontSize: 13 }}>Easy</Text>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1 }}>4d</Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>
    )
  }

  // Dashboard screen
  const stages = summary?.stages ?? { apprentice: 0, guru: 0, master: 0, enlightened: 0, burned: 0 }

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>Practice</Text>
          <Text style={{ fontSize: 14, color: colors.muted, marginTop: 2 }}>Spaced repetition review</Text>
        </View>

        {/* Review button */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable
            style={{
              backgroundColor: (summary?.dueNow ?? 0) > 0 ? colors.primary : colors.surface,
              borderRadius: 16,
              paddingVertical: 20,
              alignItems: "center",
            }}
            onPress={startReview}
            disabled={(summary?.dueNow ?? 0) === 0}
          >
            <HugeiconsIcon
              icon={RepeatIcon}
              size={28}
              color={(summary?.dueNow ?? 0) > 0 ? "#fff" : colors.muted}
            />
            <Text style={{
              marginTop: 8,
              fontSize: 20,
              fontWeight: "bold",
              color: (summary?.dueNow ?? 0) > 0 ? "#fff" : colors.foreground,
            }}>
              {summary?.dueNow ?? 0} Reviews
            </Text>
            <Text style={{
              marginTop: 2,
              fontSize: 14,
              color: (summary?.dueNow ?? 0) > 0 ? "rgba(255,255,255,0.8)" : colors.muted,
            }}>
              {(summary?.dueNow ?? 0) > 0 ? "Tap to start" : "All caught up!"}
            </Text>
          </Pressable>
        </View>

        {/* Upcoming */}
        <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <HugeiconsIcon icon={Time01Icon} size={18} color={colors.muted} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>{summary?.dueNextHour ?? 0}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>Next hour</Text>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: colors.surface, borderRadius: 12, padding: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <HugeiconsIcon icon={Calendar01Icon} size={18} color={colors.muted} />
            <View>
              <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.foreground }}>{summary?.dueNextDay ?? 0}</Text>
              <Text style={{ fontSize: 11, color: colors.muted }}>Next 24h</Text>
            </View>
          </View>
        </View>

        {/* SRS Stages */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>
            SRS Stages
          </Text>
          <View style={{ backgroundColor: colors.surface, borderRadius: 16, overflow: "hidden" }}>
            {(["apprentice", "guru", "master", "enlightened", "burned"] as const).map((stage, i) => {
              const count = stages[stage]
              const total = summary?.total ?? 1
              const pct = total > 0 ? (count / total) * 100 : 0
              const color = stageColors[stage]
              const labels = {
                apprentice: "Apprentice",
                guru: "Guru",
                master: "Master",
                enlightened: "Enlightened",
                burned: "Burned",
              }
              const descriptions = {
                apprentice: "Just learning, reviews every few hours",
                guru: "Getting familiar, reviews every few days",
                master: "Solid recall, reviews weekly",
                enlightened: "Near mastery, reviews monthly",
                burned: "Mastered, no more reviews needed",
              }

              return (
                <View
                  key={stage}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderBottomWidth: i < 4 ? 0.5 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color, marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "600", color: colors.foreground }}>{labels[stage]}</Text>
                    <Text style={{ fontSize: 11, color: colors.muted, marginTop: 1 }}>{descriptions[stage]}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>{count}</Text>
                    {total > 0 && (
                      <Text style={{ fontSize: 11, color: colors.muted }}>{Math.round(pct)}%</Text>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        </View>

        {/* Total */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <View style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <Text style={{ fontSize: 14, color: colors.muted }}>Total items in SRS</Text>
            <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.foreground }}>{summary?.total ?? 0}</Text>
          </View>
        </View>

        {/* Stage progress bar */}
        {(summary?.total ?? 0) > 0 && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <View style={{ flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden" }}>
              {(["apprentice", "guru", "master", "enlightened", "burned"] as const).map((stage) => {
                const count = stages[stage]
                const total = summary?.total ?? 1
                const pct = (count / total) * 100
                if (pct === 0) return null
                return (
                  <View key={stage} style={{ width: `${pct}%`, height: 8, backgroundColor: stageColors[stage] }} />
                )
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
