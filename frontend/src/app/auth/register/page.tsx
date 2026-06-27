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

export default function RegisterPage() {
  const router = useRouter()
  const register = useAuthStore((state) => state.register)
  const isLoading = useAuthStore((state) => state.isLoading)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [confirmError, setConfirmError] = useState('')

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
      toast.success('¡Cuenta creada exitosamente!')
      router.push('/')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo completar el registro'))
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-md" padding="lg">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-indigo-500">
            ShopFlow
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-600">
            Completa el formulario para registrarte en ShopFlow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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

          <Input
            label="Contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />

          <Input
            label="Confirmar contraseña"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repite tu contraseña"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            error={confirmError}
            required
            minLength={6}
          />

          <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
            Registrarse
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          ¿Ya tienes una cuenta?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-indigo-500 transition-colors hover:text-indigo-600"
          >
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}
