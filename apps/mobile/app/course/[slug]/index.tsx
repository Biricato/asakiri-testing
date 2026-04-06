import { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"
import { s, colors as staticColors } from "@/lib/styles"

type Course = {
  id: string
  slug: string
  courseId: string
  title: string
  subtitle: string | null
  targetLanguage: string
  sourceLanguage: string
  difficulty: string
  coverImageUrl: string | null
  creatorName: string | null
}

export default function CourseDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const colors = useColors()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    api<{ course: Course }>(`/api/v1/courses/${slug}`)
      .then((d) => setCourse(d.course))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [slug])

  async function handleEnroll() {
    if (!course) return
    setEnrolling(true)
    try {
      await api(`/api/v1/learn/enroll/${course.id}`, { method: "POST" })
      // Set as active course
      await api("/api/v1/learn/active", {
        method: "POST",
        body: JSON.stringify({ courseId: course.courseId }),
      })
      router.replace("/(tabs)/learn")
    } catch {
    } finally {
      setEnrolling(false)
    }
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

  if (!course) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: colors.muted }}>Course not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
          <Pressable
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8 }}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} color={colors.foreground} />
            <Text style={{ fontSize: 14, color: colors.foreground }}>Back</Text>
          </Pressable>
        </View>

        {course.coverImageUrl && (
          <Image
            source={{ uri: course.coverImageUrl }}
            style={{ marginHorizontal: 16, marginTop: 12, height: 192, borderRadius: 16 }}
            resizeMode="cover"
          />
        )}

        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: colors.foreground }}>{course.title}</Text>
          {course.subtitle && (
            <Text style={{ marginTop: 4, fontSize: 14, color: colors.muted }}>{course.subtitle}</Text>
          )}

          <View style={{ marginTop: 12, flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={s.chip}>
              <Text style={s.chipText}>{course.difficulty}</Text>
            </View>
            <View style={s.chip}>
              <Text style={s.chipText}>{course.sourceLanguage} → {course.targetLanguage}</Text>
            </View>
          </View>

          {course.creatorName && (
            <Text style={{ marginTop: 12, fontSize: 14, color: colors.muted }}>by {course.creatorName}</Text>
          )}

          <Pressable
            style={[s.buttonPrimary, { marginTop: 24, opacity: enrolling ? 0.6 : 1 }]}
            onPress={handleEnroll}
            disabled={enrolling}
          >
            <Text style={s.buttonPrimaryText}>{enrolling ? "Enrolling..." : "Enroll & Start Learning"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
