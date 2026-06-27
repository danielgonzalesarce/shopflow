'use client'

import AuthGuard from '@/components/auth/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-slate-100">
        <AdminSidebar />
        <div className="ml-64 flex min-h-screen flex-col">
          <AdminHeader />
          <div className="flex-1 p-8">{children}</div>
        </div>
      </div>
    </AuthGuard>
  )
}
