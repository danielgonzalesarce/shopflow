'use client'

import AuthGuard from '@/components/auth/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-slate-50">
        <AdminSidebar />
        <main className="ml-64 min-h-screen p-8">{children}</main>
      </div>
    </AuthGuard>
  )
}
