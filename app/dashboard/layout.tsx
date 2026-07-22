import RequireAuth from '@/components/dashboard/RequireAuth'
import Sidebar from '@/components/dashboard/Sidebar'
import MobileNav from '@/components/dashboard/MobileNav'
import Topbar from '@/components/dashboard/Topbar'
import IncomingCallListener from '@/components/video/IncomingCallListener'
import NotificationBridge from '@/components/dashboard/NotificationBridge'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Topbar />
          <main className="px-4 pb-24 pt-6 lg:px-8 lg:pb-8">{children}</main>
        </div>
        <MobileNav />
        <IncomingCallListener />
        <NotificationBridge />
      </div>
    </RequireAuth>
  )
}
