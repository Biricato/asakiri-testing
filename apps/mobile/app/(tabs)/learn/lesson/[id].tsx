import { useState, useEffect } from "react"
import { View, Text, ScrollView, ActivityIndicator } from "@/tw"
import { useLocalSearchParams, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button } from "@/components/ui"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { ArrowLeft01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"

type Section = {
  id: string
  title: string | null
  content: any
  order: number
}

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const colors = useColors()
  const [title, setTitle] = useState("")
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    api<{ lesson: { title: string }; sections: Section[] }>(`/api/v1/learn/lesson/${id}`)
      .then((d) => {
        setTitle(d.lesson.title)
        setSections(d.sections)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  async function handleComplete() {
    setCompleting(true)
    await api(`/api/v1/learn/lesson/${id}/complete`, { method: "POST" }).catch(() => {})
    setCompleting(false)
    router.back()
  }

  // Extract plain text from TipTap JSON content
  function renderContent(content: any): string {
    if (!content) return ""
    if (typeof content === "string") return content
    if (content.type === "text") return content.text ?? ""
    if (content.content) {
      return content.content.map((c: any) => renderContent(c)).join("")
    }
    return ""
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
      <View className="flex-row items-center gap-2 border-b border-border px-4 py-3">
        <Button variant="ghost" size="sm" isIconOnly onPress={() => router.back()}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors.foreground} />
        </Button>
        <Text className="flex-1 text-lg font-bold text-foreground" numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {sections.map((s) => (
          <View key={s.id} className="mb-6">
            {s.title && (
              <Text className="mb-2 text-lg font-semibold text-foreground">{s.title}</Text>
            )}
            <Text className="text-base leading-relaxed text-foreground">
              {renderContent(s.content)}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View className="border-t border-border px-4 py-3">
        <Button onPress={handleComplete} isDisabled={completing}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="#fff" />
          <Text style={{ color: "#fff" }}>{completing ? "Completing..." : "Mark as complete"}</Text>
        </Button>
      </View>
    </SafeAreaView>
  )
}
