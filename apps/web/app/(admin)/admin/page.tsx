import Link from "next/link"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

export default function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground mt-2">Manage your platform.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Users</CardTitle>
              <CardDescription>
                Manage users, roles, and permissions
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/courses">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Oversee all courses on the platform
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/settings">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>
                Registration mode, course creation policy
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/admin/invites">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle>Invites</CardTitle>
              <CardDescription>
                Manage invite links for new users
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
