'use client'

import AuthGuard from '@/components/auth/AuthGuard'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard role="admin">
      <div className="min-h-screen bg-[var(--background)]">
        <div
          className="pointer-events-none fixed inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(229,57,53,0.12) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(0,212,255,0.08) 0%, transparent 40%)'
          }}
        />
        <AdminSidebar />
        <div className="relative ml-64 flex min-h-screen flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
