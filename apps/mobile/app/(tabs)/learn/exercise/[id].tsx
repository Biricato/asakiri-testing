import { useState, useEffect } from "react"
import { View, Text, Pressable, ActivityIndicator } from "@/tw"
import { useLocalSearchParams, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/ui"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { ArrowLeft01Icon, CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"

type Option = { id: string; label: string; value: string; isCorrect: boolean }
type Variant = {
  variantId: string
  type: string
  prompt: string
  solution: string
  options?: Option[]
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const colors = useColors()
  const [title, setTitle] = useState("")
  const [variants, setVariants] = useState<Variant[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })

  useEffect(() => {
    api<{ group: { title: string }; variants: Variant[] }>(`/api/v1/learn/exercise/${id}`)
      .then((d) => {
        setTitle(d.group.title)
        setVariants(d.variants)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const variant = variants[current]

  function handleSelect(optionId: string) {
    if (answered) return
    setSelected(optionId)
  }

  async function handleCheck() {
    if (!variant || !selected) return
    const option = variant.options?.find((o) => o.id === selected)
    const isCorrect = option?.isCorrect ?? false

    setAnswered(true)
    setScore((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1,
    }))

    await api("/api/v1/learn/exercise/attempt", {
      method: "POST",
      body: JSON.stringify({
        variantId: variant.variantId,
        isCorrect,
        durationMs: 0,
        answer: { selected },
      }),
    }).catch(() => {})
  }

  function handleNext() {
    if (current + 1 >= variants.length) {
      setDone(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
      setAnswered(false)
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

  if (done) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center px-6">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} color={colors.success} />
          <Text className="mt-4 text-2xl font-bold text-foreground">{pct}%</Text>
          <Text className="mt-1 text-sm text-muted-foreground">
            {score.correct} of {score.total} correct
          </Text>
          <Button className="mt-8" onPress={() => router.back()}>Done</Button>
        </View>
      </SafeAreaView>
    )
  }

  if (!variant) return null

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" isIconOnly onPress={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors.foreground} />
        </Button>
        <Text className="flex-1 text-sm text-muted-foreground">
          {current + 1} / {variants.length}
        </Text>
      </View>

      <View className="flex-1 justify-center px-6">
        <Text className="mb-8 text-center text-xl font-bold text-foreground">
          {variant.prompt}
        </Text>

        {variant.type === "mcq" && variant.options ? (
          <View className="gap-3">
            {variant.options.map((opt) => {
              const isSelected = selected === opt.id
              const showCorrect = answered && opt.isCorrect
              const showWrong = answered && isSelected && !opt.isCorrect

              return (
                <Pressable
                  key={opt.id}
                  onPress={() => handleSelect(opt.id)}
                  className={`rounded-2xl border-2 px-4 py-3 ${
                    showCorrect
                      ? "border-success bg-success/10"
                      : showWrong
                        ? "border-danger bg-danger/10"
                        : isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border"
                  }`}
                >
                  <Text className="text-base text-foreground">{opt.label || opt.value}</Text>
                </Pressable>
              )
            })}
          </View>
        ) : (
          <View className="rounded-2xl bg-surface-secondary p-4">
            <Text className="text-center text-base text-foreground">{variant.solution}</Text>
          </View>
        )}
      </View>

      <View className="border-t border-border px-4 py-3">
        {!answered ? (
          <Button onPress={handleCheck} isDisabled={!selected}>Check</Button>
        ) : (
          <Button onPress={handleNext}>
            {current + 1 >= variants.length ? "Finish" : "Next"}
          </Button>
        )}
      </View>
    </SafeAreaView>
  )
}
