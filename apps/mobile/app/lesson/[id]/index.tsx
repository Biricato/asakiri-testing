import { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { ArrowLeft01Icon, CheckmarkCircle02Icon, SquareLock02Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"
import { renderTipTap } from "@/lib/tiptap-renderer"
import { s } from "@/lib/styles"

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
  const [patreonGate, setPatreonGate] = useState<{ tierTitle: string; connected: boolean } | null>(null)

  useEffect(() => {
    fetch(`${require("@/lib/api").getServerUrl()}/api/v1/learn/lesson/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "Origin": require("@/lib/api").getServerUrl(),
        ...(require("@/lib/api").sessionToken ? { "Authorization": `Bearer ${require("@/lib/api").sessionToken}` } : {}),
      },
    })
      .then(async (res) => {
        if (res.status === 403) {
          const body = await res.json()
          setPatreonGate({ tierTitle: body.tierTitle, connected: body.connected })
          return
        }
        if (!res.ok) throw new Error("Failed")
        const d = await res.json()
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

  const tipTapColors = { foreground: colors.foreground, muted: colors.muted, border: colors.border, surface: colors.surface }

  if (patreonGate) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
          <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors.foreground} />
          </Pressable>
          <Text style={{ flex: 1, fontSize: 18, fontWeight: "bold", color: colors.foreground }}>Locked</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <HugeiconsIcon icon={SquareLock02Icon} size={48} color={colors.muted} />
          <Text style={{ marginTop: 16, fontSize: 20, fontWeight: "bold", color: colors.foreground, textAlign: "center" }}>
            Patreon supporters only
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: colors.muted, textAlign: "center" }}>
            This lesson requires the {patreonGate.tierTitle} tier on Patreon.
          </Text>
          {!patreonGate.connected && (
            <Text style={{ marginTop: 12, fontSize: 13, color: colors.muted, textAlign: "center" }}>
              Connect your Patreon account in Settings to verify your membership.
            </Text>
          )}
          <Pressable style={[s.buttonOutline, { marginTop: 24, paddingHorizontal: 24 }]} onPress={() => router.back()}>
            <Text style={s.buttonOutlineText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (loading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors.foreground} />
        </Pressable>
        <Text style={{ flex: 1, fontSize: 18, fontWeight: "bold", color: colors.foreground }} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 16, flexGrow: 0 }}>
        {sections.map((sec, i) => (
          <View key={sec.id} style={{
            marginBottom: i < sections.length - 1 ? 16 : 0,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 16,
            padding: 16,
          }}>
            {sec.title && (
              <Text style={{ marginBottom: 12, fontSize: 18, fontWeight: "700", color: colors.foreground }}>{sec.title}</Text>
            )}
            {renderTipTap(sec.content, tipTapColors)}
          </View>
        ))}
      </ScrollView>

      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable
          onPress={handleComplete}
          disabled={completing}
          style={[s.buttonPrimary, { flexDirection: "row", justifyContent: "center", gap: 8, opacity: completing ? 0.6 : 1 }]}
        >
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} color="#fff" />
          <Text style={s.buttonPrimaryText}>{completing ? "Completing..." : "Mark as complete"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}
