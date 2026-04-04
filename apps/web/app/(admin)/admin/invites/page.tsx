import { getInvites } from "@/features/admin/actions/invites"
import { InvitesTable } from "@/features/admin/components/invites-table"
import { InviteDialog } from "@/features/admin/components/invite-dialog"

export default async function AdminInvitesPage() {
  const invites = await getInvites()

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invites</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage invite links.
          </p>
        </div>
        <InviteDialog />
      </div>
      <div className="mt-6">
        <InvitesTable invites={invites} />
      </div>
    </div>
  )
}
