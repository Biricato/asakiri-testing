import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "@/tw"
import { useFocusEffect } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/ui"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { RepeatIcon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"

type DueItem = {
  variantId: string
  type: string
  prompt: string
  solution: string
}

export default function PracticeScreen() {
  const colors = useColors()
  const [items, setItems] = useState<DueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [done, setDone] = useState(false)

  const loadDue = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api<{ items: DueItem[] }>("/api/v1/srs/due")
      setItems(data.items)
      setCurrent(0)
      setShowAnswer(false)
      setDone(false)
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      loadDue()
    }, [loadDue]),
  )

  async function handleReview(quality: number) {
    const item = items[current]
    if (!item) return
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
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (items.length === 0 || done) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="border-b border-border px-4 py-3">
          <Text className="text-lg font-bold text-foreground">Practice</Text>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <HugeiconsIcon icon={done ? CheckmarkCircle02Icon : RepeatIcon} size={48} color={done ? colors.success : colors.muted} />
          <Text className="mt-4 text-lg font-semibold text-foreground">
            {done ? "All done!" : "No reviews due"}
          </Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            {done ? "Great job! Come back later for more reviews." : "Complete lessons and exercises to build your review queue."}
          </Text>
          {done && (
            <Button className="mt-6" onPress={loadDue}>Check again</Button>
          )}
        </View>
      </SafeAreaView>
    )
  }

  const item = items[current]!

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="border-b border-border px-4 py-3">
        <Text className="text-lg font-bold text-foreground">Practice</Text>
        <Text className="text-xs text-muted-foreground">{current + 1} of {items.length}</Text>
      </View>

      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-center text-2xl font-bold text-foreground">{item.prompt}</Text>

        {showAnswer ? (
          <View className="mt-6 w-full">
            <View className="rounded-2xl bg-surface-secondary p-4">
              <Text className="text-center text-lg text-foreground">{item.solution}</Text>
            </View>
            <View className="mt-6 flex-row gap-3">
              <Button variant="outline" className="flex-1" onPress={() => handleReview(1)}>Hard</Button>
              <Button variant="outline" className="flex-1" onPress={() => handleReview(3)}>Good</Button>
              <Button className="flex-1" onPress={() => handleReview(5)}>Easy</Button>
            </View>
          </View>
        ) : (
          <Button className="mt-8" onPress={() => setShowAnswer(true)}>Show answer</Button>
        )}
      </View>
    </SafeAreaView>
  )
}
