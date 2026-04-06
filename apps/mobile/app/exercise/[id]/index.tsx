import { useState, useEffect } from "react"
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { ArrowLeft01Icon, CheckmarkCircle02Icon, SquareLock02Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"
import { s } from "@/lib/styles"

type Option = { id: string; label: string; value: string; isCorrect: boolean }
type Variant = {
  variantId: string
  type: string
  prompt: any
  solution: any
  options?: Option[]
}

function getPromptText(prompt: any): string {
  if (!prompt) return ""
  if (typeof prompt === "string") return prompt
  if (prompt.stem) return prompt.stem
  if (prompt.clozeText) return prompt.clozeText
  if (prompt.text) return prompt.text
  if (prompt.prompt) return prompt.prompt
  return JSON.stringify(prompt)
}

function getCorrectAnswer(solution: any): string {
  if (!solution) return ""
  if (typeof solution === "string") return solution
  if (solution.correctAnswer) return solution.correctAnswer
  if (solution.text) return solution.text
  if (solution.answer) return solution.answer
  return JSON.stringify(solution)
}

function getAlternatives(solution: any): string[] {
  if (!solution) return []
  if (solution.acceptedAlternatives) return solution.acceptedAlternatives
  if (solution.alternatives) return solution.alternatives
  return []
}

function checkTextAnswer(userInput: string, solution: any): boolean {
  const correct = getCorrectAnswer(solution).trim().toLowerCase()
  const input = userInput.trim().toLowerCase()
  if (input === correct) return true
  const alts = getAlternatives(solution)
  return alts.some((alt: string) => alt.trim().toLowerCase() === input)
}

export default function ExerciseScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const colors = useColors()
  const [variants, setVariants] = useState<Variant[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [userInput, setUserInput] = useState("")
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [loading, setLoading] = useState(true)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [patreonGate, setPatreonGate] = useState<{ tierTitle: string; connected: boolean } | null>(null)

  useEffect(() => {
    fetch(`${require("@/lib/api").getServerUrl()}/api/v1/learn/exercise/${id}`, {
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
        setVariants(d.variants)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  const variant = variants[current]
  const isMcq = variant?.type === "mcq" && variant.options && variant.options.length > 0
  const canCheck = isMcq ? !!selected : userInput.trim().length > 0

  async function handleCheck() {
    if (!variant) return
    let correct = false

    if (isMcq) {
      const option = variant.options?.find((o) => o.id === selected)
      correct = option?.isCorrect ?? false
    } else {
      correct = checkTextAnswer(userInput, variant.solution)
    }

    setIsCorrect(correct)
    setAnswered(true)
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
    }))

    await api("/api/v1/learn/exercise/attempt", {
      method: "POST",
      body: JSON.stringify({
        variantId: variant.variantId,
        isCorrect: correct,
        durationMs: 0,
        answer: isMcq ? { selected } : { input: userInput },
      }),
    }).catch(() => {})
  }

  function handleNext() {
    if (current + 1 >= variants.length) {
      setDone(true)
    } else {
      setCurrent(current + 1)
      setSelected(null)
      setUserInput("")
      setAnswered(false)
      setIsCorrect(false)
    }
  }

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
            This exercise requires the {patreonGate.tierTitle} tier on Patreon.
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

  if (done) {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <HugeiconsIcon icon={CheckmarkCircle02Icon} size={48} color={colors.success} />
          <Text style={{ marginTop: 16, fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{pct}%</Text>
          <Text style={{ marginTop: 4, fontSize: 14, color: colors.muted }}>
            {score.correct} of {score.total} correct
          </Text>
          <Pressable style={[s.buttonPrimary, { marginTop: 32, paddingHorizontal: 32 }]} onPress={() => router.back()}>
            <Text style={s.buttonPrimaryText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  if (!variant) return null

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={18} color={colors.foreground} />
        </Pressable>
        <Text style={{ flex: 1, fontSize: 14, color: colors.muted }}>
          {current + 1} / {variants.length}
        </Text>
      </View>

      {/* Content */}
      <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: 24 }}>
        <Text style={{ marginBottom: 32, textAlign: "center", fontSize: 20, fontWeight: "bold", color: colors.foreground }}>
          {getPromptText(variant.prompt)}
        </Text>

        {isMcq ? (
          /* MCQ options */
          <View style={{ gap: 12 }}>
            {variant.options!.map((opt) => {
              const isSelected = selected === opt.id
              const showCorrect = answered && opt.isCorrect
              const showWrong = answered && isSelected && !opt.isCorrect

              let borderColor = colors.border
              let bgColor = "transparent"
              if (showCorrect) { borderColor = colors.success; bgColor = colors.success + "18" }
              else if (showWrong) { borderColor = colors.danger; bgColor = colors.danger + "18" }
              else if (isSelected) { borderColor = colors.primary; bgColor = colors.primary + "18" }

              return (
                <Pressable
                  key={opt.id}
                  onPress={() => { if (!answered) setSelected(opt.id) }}
                  style={{ borderRadius: 16, borderWidth: 2, borderColor, backgroundColor: bgColor, paddingHorizontal: 16, paddingVertical: 12 }}
                >
                  <Text style={{ fontSize: 16, color: colors.foreground }}>{opt.label || opt.value}</Text>
                </Pressable>
              )
            })}
          </View>
        ) : (
          /* Fill-in-the-blank / text input */
          <View style={{ gap: 12 }}>
            <TextInput
              style={{
                borderWidth: 2,
                borderColor: answered
                  ? (isCorrect ? colors.success : colors.danger)
                  : colors.border,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 18,
                textAlign: "center",
                color: colors.foreground,
                backgroundColor: answered
                  ? (isCorrect ? colors.success + "18" : colors.danger + "18")
                  : "transparent",
              }}
              value={userInput}
              onChangeText={setUserInput}
              editable={!answered}
              placeholder="Type your answer..."
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {answered && !isCorrect && (
              <View style={{ borderRadius: 12, backgroundColor: colors.success + "18", padding: 12 }}>
                <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 2 }}>Correct answer:</Text>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.success }}>
                  {getCorrectAnswer(variant.solution)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Bottom buttons */}
      <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingHorizontal: 16, paddingVertical: 12, flexDirection: "row", gap: 12 }}>
        {!answered ? (
          <>
            <Pressable onPress={handleNext} style={[s.buttonOutline, { flex: 0, paddingHorizontal: 20 }]}>
              <Text style={s.buttonOutlineText}>Skip</Text>
            </Pressable>
            <Pressable onPress={handleCheck} disabled={!canCheck} style={[s.buttonPrimary, { flex: 1, opacity: canCheck ? 1 : 0.5 }]}>
              <Text style={s.buttonPrimaryText}>Check</Text>
            </Pressable>
          </>
        ) : (
          <Pressable onPress={handleNext} style={[s.buttonPrimary, { flex: 1 }]}>
            <Text style={s.buttonPrimaryText}>{current + 1 >= variants.length ? "Finish" : "Next"}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  )
}
