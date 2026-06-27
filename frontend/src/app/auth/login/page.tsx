'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import { getApiErrorMessage } from '@/lib/errors'
import { useAuthStore } from '@/store/auth.store'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      await login(email.trim(), password)
      router.push('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Credenciales inválidas'))
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-md" padding="lg">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-indigo-500">
            ShopFlow
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-slate-600">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Iniciar sesión
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿No tienes una cuenta?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-indigo-500 transition-colors hover:text-indigo-600"
          >
            Regístrate aquí
          </Link>
        </p>
      </Card>
    </div>
  )
}
