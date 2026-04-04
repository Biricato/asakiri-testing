import { notFound } from "next/navigation"
import Link from "next/link"
import { getCourseBySlug } from "@/features/publish/actions/catalog"
import { getMyEnrollment } from "@/features/publish/actions/enroll"
import { EnrollButton } from "@/features/publish/components/enroll-button"
import { Chip } from "@heroui/react"
import { Button } from "@heroui/react"
import { Card } from "@heroui/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

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
    <div className="p-6">
      <Link href="/courses"><Button
        variant="ghost"
        size="sm"
        className="mb-4"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="mr-1" />
        Back to catalog
      </Button></Link>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1">
          {course.coverImageUrl && (
            <div className="mb-4 aspect-video overflow-hidden rounded-lg">
              <img
                src={course.coverImageUrl}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl font-bold">{course.title}</h1>
          {course.subtitle && (
            <p className="text-muted-foreground mt-2 text-lg">
              {course.subtitle}
            </p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            <Chip variant="secondary" className="capitalize">
              {course.difficulty}
            </Chip>
            <Chip variant="secondary">
              {course.sourceLanguage} → {course.targetLanguage}
            </Chip>
            <Chip variant="secondary">v{course.version}</Chip>
          </div>

          {course.creatorName && (
            <p className="text-muted-foreground mt-4 text-sm">
              Created by {course.creatorName}
            </p>
          )}
        </div>

        <Card className="w-full lg:w-72">
          <Card.Header>
            <Card.Title className="text-base">Enroll</Card.Title>
          </Card.Header>
          <Card.Content>
            <EnrollButton
              publishedCourseId={course.id}
              enrollment={enrollment}
            />
          </Card.Content>
        </Card>
      </div>
    </div>
  )
}
