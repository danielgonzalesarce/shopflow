'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useEffect, useState } from 'react'
import { ArrowRight, Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthBrandPanel from '@/components/auth/AuthBrandPanel'
import AuthDivider from '@/components/auth/AuthDivider'
import AuthFormShell from '@/components/auth/AuthFormShell'
import SocialAuthButtons from '@/components/auth/SocialAuthButtons'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { consumeAuthRedirect } from '@/lib/guest-storage'
import { getApiErrorMessage } from '@/lib/errors'
import { useAuthStore } from '@/store/auth.store'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const redirectParam = searchParams.get('redirect') || '/'
  const registerHref = `/auth/register${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`

  useEffect(() => {
    const oauthError = searchParams.get('error')
    if (oauthError) {
      toast.error(decodeURIComponent(oauthError.replace(/\+/g, ' ')))
    }
  }, [searchParams])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await login(email.trim(), password)
      const loggedUser = useAuthStore.getState().user
      const defaultPath = loggedUser?.role === 'admin' ? '/admin' : '/'
      const redirect =
        searchParams.get('redirect') || consumeAuthRedirect(defaultPath)
      toast.success(
        loggedUser?.role === 'admin'
          ? '¡Bienvenido al panel de administración!'
          : '¡Bienvenido! Tus productos fueron guardados.'
      )
      router.push(redirect)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Credenciales inválidas'))
    }
  }

  return (
    <AuthFormShell
      title="Iniciar sesión"
      subtitle="Accede con Google, GitHub o tu correo y contraseña"
      footer={
        <p className="text-sm text-slate-400">
          ¿No tienes una cuenta?{' '}
          <Link
            href={registerHref}
            className="font-semibold text-neon-cyan transition-colors hover:text-neon-cyan-light"
          >
            Regístrate gratis
          </Link>
        </p>
      }
    >
      <SocialAuthButtons redirect={redirectParam} />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-200">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              className="w-full rounded-xl border border-[var(--border)] bg-surface px-4 py-3 pr-12 text-white shadow-sm transition-all placeholder:text-slate-500 focus:border-neon-red focus:outline-none focus:ring-4 focus:ring-neon-red/15"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-500 hover:text-white"
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          <Lock className="mr-2 h-4 w-4" />
          Iniciar sesión
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </AuthFormShell>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4.25rem)] bg-[var(--background)]">
      <AuthBrandPanel
        title="Bienvenido de vuelta"
        description="Accede a tu cuenta para finalizar tu compra. Tu carrito y favoritos se conservarán automáticamente."
        footer={
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-2xl border border-neon-cyan/30 bg-black/30 px-5 py-4 backdrop-blur-sm">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-neon-cyan" />
              <p className="text-sm leading-relaxed text-slate-200">
                Inicio rápido con <strong className="text-white">Google</strong> o{' '}
                <strong className="text-white">GitHub</strong> sin crear contraseña.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-xs text-slate-400">
              Admin demo: <span className="text-slate-200">superadmin@shopflow.com</span> /{' '}
              <span className="text-slate-200">SuperAdmin2026!</span>
            </div>
          </div>
        }
      />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-slate-400">Cargando...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
