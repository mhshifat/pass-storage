import { AdminRouteGuard } from "./admin-route-guard"
import { AdminLayoutClient } from "./admin-layout-client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminRouteGuard>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminRouteGuard>
  )
}
