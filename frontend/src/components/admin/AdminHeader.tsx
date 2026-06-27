'use client'

import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import Button from '@/components/ui/Button'

export default function AdminHeader() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
          Administración
        </p>
        <h1 className="text-sm font-medium text-slate-600">
          Hola, {user?.full_name || 'Administrador'}
        </h1>
      </div>

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Salir
      </Button>
    </header>
  )
}
