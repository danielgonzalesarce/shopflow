'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { consumeAuthRedirect } from '@/lib/guest-storage'
import { getApiErrorMessage } from '@/lib/errors'
import { useAuthStore } from '@/store/auth.store'

export default function OAuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const completeOAuthLogin = useAuthStore((s) => s.completeOAuthLogin)
  const handled = useRef(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const redirectParam = searchParams.get('redirect')

    if (error) {
      const msg = decodeURIComponent(error.replace(/\+/g, ' '))
      setErrorMsg(msg)
      toast.error(msg)
      setTimeout(() => router.replace('/auth/login'), 4000)
      return
    }

    if (!token) {
      const msg = 'No se recibió el token de autenticación'
      setErrorMsg(msg)
      toast.error(msg)
      setTimeout(() => router.replace('/auth/login'), 3000)
      return
    }

    const run = async () => {
      try {
        const user = await completeOAuthLogin(token)
        const defaultPath = user?.role === 'admin' ? '/admin' : '/'
        const redirect = redirectParam || consumeAuthRedirect(defaultPath)
        toast.success('¡Sesión iniciada correctamente!')
        router.replace(redirect)
      } catch (err) {
        const msg = getApiErrorMessage(err, 'No se pudo completar el inicio de sesión')
        setErrorMsg(msg)
        toast.error(msg)
        setTimeout(() => router.replace('/auth/login'), 4000)
      }
    }

    run()
  }, [searchParams, router, completeOAuthLogin])

  if (errorMsg) {
    return (
      <div className="flex min-h-[calc(100vh-4.25rem)] flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <p className="mt-4 max-w-md text-lg font-semibold text-white">Error al iniciar sesión</p>
        <p className="mt-2 max-w-lg text-sm text-slate-400">{errorMsg}</p>
        <p className="mt-4 text-xs text-slate-500">Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-4.25rem)] flex-col items-center justify-center bg-[var(--background)] px-4 text-center">
      <Loader2 className="h-10 w-10 animate-spin text-neon-red" />
      <p className="mt-4 text-lg font-semibold text-white">Completando inicio de sesión...</p>
      <p className="mt-2 text-sm text-slate-400">Un momento, estamos preparando tu cuenta</p>
    </div>
  )
}
