import { getUsers } from "@/features/admin/actions/users"
import { UsersTable } from "@/features/admin/components/users-table"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const page = Number(params.page ?? "1")
  const search = params.search ?? ""

  const result = await getUsers({ page, search })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Users</h1>
      <p className="text-muted-foreground mt-2">
        Manage users, roles, and access.
      </p>
      <div className="mt-6">
        <UsersTable result={result} />
      </div>
    </div>
  )
}
