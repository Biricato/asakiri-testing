import { useState, useEffect } from "react"
import { View, Text, ScrollView, Image, ActivityIndicator } from "react-native"
import { useLocalSearchParams, router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Button, Chip } from "heroui-native"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"

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
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    )
  }

  if (!course) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-muted-foreground">Course not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView className="flex-1">
        <View className="px-4 pt-3">
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            <Text>Back</Text>
          </Button>
        </View>

        {course.coverImageUrl && (
          <Image
            source={{ uri: course.coverImageUrl }}
            className="mx-4 mt-3 h-48 rounded-2xl"
            resizeMode="cover"
          />
        )}

        <View className="px-4 py-4">
          <Text className="text-2xl font-bold text-foreground">{course.title}</Text>
          {course.subtitle && (
            <Text className="mt-1 text-sm text-muted-foreground">{course.subtitle}</Text>
          )}

          <View className="mt-3 flex-row items-center gap-2">
            <Chip size="sm">{course.difficulty}</Chip>
            <Chip size="sm">{course.sourceLanguage} → {course.targetLanguage}</Chip>
          </View>

          {course.creatorName && (
            <Text className="mt-3 text-sm text-muted-foreground">by {course.creatorName}</Text>
          )}

          <Button className="mt-6" onPress={handleEnroll} isDisabled={enrolling}>
            {enrolling ? "Enrolling..." : "Enroll & Start Learning"}
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
