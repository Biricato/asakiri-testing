import { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, TextInput } from "react-native"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Chip } from "heroui-native"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"

type Course = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  targetLanguage: string
  sourceLanguage: string
  difficulty: string
  coverImageUrl: string | null
  creatorName: string | null
}

export default function ExploreScreen() {
  const colors = useColors()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const timeout = setTimeout(() => {
      api<{ courses: Course[] }>(`/api/v1/courses?search=${encodeURIComponent(search)}`)
        .then((d) => setCourses(d.courses))
        .catch(() => {})
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="border-b border-border px-4 py-3">
        <Text className="text-lg font-bold text-foreground">Explore</Text>
      </View>

      <View className="flex-row items-center gap-2 border-b border-border px-4 py-2">
        <HugeiconsIcon icon={Search01Icon} size={18} color={colors.muted} />
        <TextInput
          placeholder="Search courses..."
          placeholderTextColor="#999"
          value={search}
          onChangeText={setSearch}
          className="flex-1 text-sm text-foreground"
        />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 py-4" contentContainerStyle={{ paddingBottom: 32 }}>
          {courses.length === 0 ? (
            <Text className="mt-8 text-center text-sm text-muted-foreground">No courses found.</Text>
          ) : (
            <View className="gap-4">
              {courses.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/(tabs)/explore/${c.slug}`)}
                  className="overflow-hidden rounded-2xl border border-border"
                >
                  {c.coverImageUrl && (
                    <Image
                      source={{ uri: c.coverImageUrl }}
                      className="h-36 w-full"
                      resizeMode="cover"
                    />
                  )}
                  <View className="p-4">
                    <Text className="text-base font-semibold text-foreground">{c.title}</Text>
                    <Text className="mt-1 text-xs text-muted-foreground">
                      {c.sourceLanguage} → {c.targetLanguage}
                    </Text>
                    <View className="mt-2 flex-row items-center gap-2">
                      <Chip size="sm">{c.difficulty}</Chip>
                      {c.creatorName && (
                        <Text className="text-xs text-muted-foreground">by {c.creatorName}</Text>
                      )}
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}
