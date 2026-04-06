import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourseBySlug } from "@/features/publish/actions/catalog"
import { getMyEnrollment } from "@/features/publish/actions/enroll"
import { EnrollButton } from "@/features/publish/components/enroll-button"
import { CoursePlaceholder } from "@/components/course-placeholder"
import { UserAvatar } from "@/components/user-avatar"
import { Chip, Button, Card } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug).catch(() => null)
  if (!course) return { title: "Course Not Found" }

  const description = `Learn ${course.targetLanguage} from ${course.sourceLanguage}. ${course.difficulty} level course${course.creatorName ? ` by ${course.creatorName}` : ""}.`

  return {
    title: course.title,
    description,
    openGraph: {
      title: course.title,
      description,
      ...(course.coverImageUrl && { images: [course.coverImageUrl] }),
    },
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) notFound()

  const enrollment = await getMyEnrollment(course.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/courses">
        <Button variant="ghost" size="sm" className="mb-6">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
          Back to catalog
        </Button>
      </Link>

      {course.coverImageUrl ? (
        <img
          src={course.coverImageUrl}
          alt={course.title}
          className="aspect-[21/9] w-full rounded-2xl object-cover"
        />
      ) : (
        <CoursePlaceholder title={course.title} />
      )}

      <div className="mt-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        {course.subtitle && (
          <p className="text-muted mt-2">{course.subtitle}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Chip variant="secondary" className="capitalize">
            {course.difficulty}
          </Chip>
          <Chip variant="secondary">
            {course.sourceLanguage} → {course.targetLanguage}
          </Chip>
        </div>

        {course.creatorName && (
          <div className="mt-4 flex items-center gap-2">
            <UserAvatar name={course.creatorName} size={24} />
            <span className="text-sm">{course.creatorName}</span>
          </div>
        )}
      </div>

      <Card className="mt-6">
        <Card.Content>
          <EnrollButton
            publishedCourseId={course.id}
            enrollment={enrollment}
          />
        </Card.Content>
      </Card>
    </div>
  )
}
