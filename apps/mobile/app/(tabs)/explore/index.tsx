import { useState, useEffect } from "react"
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, TextInput } from "react-native"
import { router } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { HugeiconsIcon } from "@hugeicons/react-native"
import { Search01Icon } from "@hugeicons/core-free-icons"
import { api } from "@/lib/api"
import { useColors } from "@/lib/use-colors"
import { s, colors as staticColors } from "@/lib/styles"

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
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.foreground }}>Explore</Text>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, paddingVertical: 8 }}>
        <HugeiconsIcon icon={Search01Icon} size={18} color={colors.muted} />
        <TextInput
          placeholder="Search courses..."
          placeholderTextColor={colors.muted}
          value={search}
          onChangeText={setSearch}
          style={{ flex: 1, fontSize: 14, color: colors.foreground }}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }} contentContainerStyle={{ paddingBottom: 32 }}>
          {courses.length === 0 ? (
            <Text style={{ marginTop: 32, textAlign: "center", fontSize: 14, color: colors.muted }}>No courses found.</Text>
          ) : (
            <View style={{ gap: 16 }}>
              {courses.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => router.push(`/course/${c.slug}`)}
                  style={{ overflow: "hidden", borderRadius: 16, borderWidth: 1, borderColor: colors.border }}
                >
                  {c.coverImageUrl && (
                    <Image
                      source={{ uri: c.coverImageUrl }}
                      style={{ height: 144, width: "100%" }}
                      resizeMode="cover"
                    />
                  )}
                  <View style={{ padding: 16 }}>
                    <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>{c.title}</Text>
                    <Text style={{ marginTop: 4, fontSize: 12, color: colors.muted }}>
                      {c.sourceLanguage} → {c.targetLanguage}
                    </Text>
                    <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <View style={s.chip}>
                        <Text style={s.chipText}>{c.difficulty}</Text>
                      </View>
                      {c.creatorName && (
                        <Text style={{ fontSize: 12, color: colors.muted }}>by {c.creatorName}</Text>
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
