'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2, ShieldAlert } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types'

interface AuthGuardProps {
  children: React.ReactNode
  role?: User['role']
}

export default function AuthGuard({ children, role }: AuthGuardProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const token = useAuthStore((state) => state.token)
  const isLoading = useAuthStore((state) => state.isLoading)

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace('/auth/login')
    }
  }, [isLoading, token, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return null
  }

  if (role && user.role !== role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-12">
        <Card className="max-w-md text-center" padding="lg">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <ShieldAlert className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="mt-5 text-xl font-bold text-slate-900">Acceso denegado</h2>
          <p className="mt-2 text-sm text-slate-600">
            No tienes permisos para acceder a esta sección.
            {role === 'admin'
              ? ' Se requiere una cuenta de administrador.'
              : ' Tu rol actual no está autorizado.'}
          </p>
          <Link href="/" className="mt-6 inline-block">
            <Button>Volver al inicio</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}
