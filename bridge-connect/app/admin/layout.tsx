import RequireAdmin from '@/components/admin/RequireAdmin'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdmin>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
      </div>
    </RequireAdmin>
  )
}
