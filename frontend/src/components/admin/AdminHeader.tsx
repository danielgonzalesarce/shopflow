'use client'

import { useRouter } from 'next/navigation'
import { LogOut, Shield } from 'lucide-react'
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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-surface/90 px-6 backdrop-blur-md lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-neon-red/30 bg-neon-red/10">
          <Shield className="h-4 w-4 text-neon-red" />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neon-cyan">
            Administración
          </p>
          <p className="text-sm font-medium text-white">
            Hola, {user?.full_name || 'Administrador'}
          </p>
        </div>
      </div>

      <Button variant="ghost" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Salir
      </Button>
    </header>
  )
}
