import Link from "next/link"
import { Card } from "@heroui/react"

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Manage your platform.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <Card.Header>
              <Card.Title>Users</Card.Title>
              <Card.Description>
                Manage users, roles, and permissions
              </Card.Description>
            </Card.Header>
          </Card>
        </Link>
        <Link href="/admin/courses">
          <Card className="hover:bg-muted/50 transition-colors">
            <Card.Header>
              <Card.Title>Courses</Card.Title>
              <Card.Description>
                Oversee all courses on the platform
              </Card.Description>
            </Card.Header>
          </Card>
        </Link>
        <Link href="/admin/settings">
          <Card className="hover:bg-muted/50 transition-colors">
            <Card.Header>
              <Card.Title>Settings</Card.Title>
              <Card.Description>
                Registration mode, course creation policy
              </Card.Description>
            </Card.Header>
          </Card>
        </Link>
        <Link href="/admin/invites">
          <Card className="hover:bg-muted/50 transition-colors">
            <Card.Header>
              <Card.Title>Invites</Card.Title>
              <Card.Description>
                Manage invite links for new users
              </Card.Description>
            </Card.Header>
          </Card>
        </Link>
      </div>
    </div>
  )
}
