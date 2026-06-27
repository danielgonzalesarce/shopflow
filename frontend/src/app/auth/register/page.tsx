'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, Suspense, useState } from 'react'
import { ArrowRight, Eye, EyeOff, UserPlus } from 'lucide-react'
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

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const redirectParam = searchParams.get('redirect') || '/'
  const loginHref = `/auth/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect')!)}` : ''}`

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setConfirmError('')

    if (password !== confirmPassword) {
      setConfirmError('Las contraseñas no coinciden')
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    try {
      await register(email.trim(), password, fullName.trim())
      const redirect =
        searchParams.get('redirect') || consumeAuthRedirect('/')
      toast.success('¡Cuenta creada! Tus productos fueron guardados.')
      router.push(redirect)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo completar el registro'))
    }
  }

  return (
    <AuthFormShell
      title="Crear cuenta"
      subtitle="Regístrate en segundos con redes sociales o con tu correo"
      footer={
        <p className="text-sm text-slate-400">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href={loginHref}
            className="font-semibold text-neon-cyan transition-colors hover:text-neon-cyan-light"
          >
            Inicia sesión
          </Link>
        </p>
      }
    >
      <SocialAuthButtons redirect={redirectParam} />

      <AuthDivider />

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nombre completo"
          name="full_name"
          type="text"
          autoComplete="name"
          placeholder="Juan Pérez"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />

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
          <label htmlFor="reg-password" className="mb-1.5 block text-sm font-semibold text-slate-200">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="reg-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
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

        <Input
          label="Confirmar contraseña"
          name="confirmPassword"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={confirmError}
          required
          minLength={6}
        />

        <p className="text-xs leading-relaxed text-slate-500">
          Al registrarte aceptas que ShopFlow guarde tu carrito y favoritos en tu cuenta.
        </p>

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          <UserPlus className="mr-2 h-4 w-4" />
          Crear cuenta
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </AuthFormShell>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4.25rem)] bg-[var(--background)]">
      <AuthBrandPanel
        title="Únete a ShopFlow"
        description="Crea tu cuenta en segundos y continúa exactamente donde lo dejaste, con tu carrito intacto."
        footer={
          <div className="flex items-start gap-3 rounded-2xl border border-neon-red/30 bg-black/30 px-5 py-4 backdrop-blur-sm">
            <UserPlus className="mt-0.5 h-6 w-6 shrink-0 text-neon-red" />
            <p className="text-sm leading-relaxed text-slate-200">
              <strong className="text-white">Google y GitHub</strong> crean tu cuenta al instante.
              También puedes usar correo y contraseña tradicional.
            </p>
          </div>
        }
      />
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center text-slate-400">Cargando...</div>
        }
      >
        <RegisterForm />
      </Suspense>
    </div>
  )
}
