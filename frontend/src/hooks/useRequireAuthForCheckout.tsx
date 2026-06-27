'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { setAuthRedirect } from '@/lib/guest-storage'
import { useAuthStore } from '@/store/auth.store'

export function useRequireAuthForCheckout() {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)

  return (redirectTo = '/checkout') => {
    if (token) {
      router.push(redirectTo)
      return true
    }

    setAuthRedirect(redirectTo)
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-slate-900">Cuenta requerida para pagar</p>
          <p className="text-sm text-slate-600">
            Inicia sesión o crea una cuenta. Tus productos se guardarán automáticamente.
          </p>
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id)
                router.push(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`)
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id)
                router.push(`/auth/register?redirect=${encodeURIComponent(redirectTo)}`)
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              Crear cuenta
            </button>
          </div>
        </div>
      ),
      { duration: 8000 }
    )

    return false
  }
}
