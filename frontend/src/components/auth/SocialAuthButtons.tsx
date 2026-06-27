'use client'

import { useEffect, useState } from 'react'
import { fetchOAuthStatus, getGitHubAuthUrl, getGoogleAuthUrl } from '@/lib/oauth'

interface SocialAuthButtonsProps {
  redirect?: string
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.9 14.6 3 12 3 7 3 3 7 3 12s4 9 9 9c5.2 0 8.6-3.7 8.6-8.9 0-.6-.1-1.1-.2-1.6H12z"
      />
      <path
        fill="#34A853"
        d="M3 7.5l3 2.2C7.2 7.2 9.4 6 12 6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.9 3.9 14.6 3 12 3 7 3 3 7 3 12c0 1.5.4 2.9 1.1 4.1L3 7.5z"
        opacity="0"
      />
      <path
        fill="#4285F4"
        d="M3 12c0 1.5.4 2.9 1.1 4.1l3-2.3C6.8 13 6.8 12 6.8 12s0-1 .3-1.8L4.1 7.9C3.4 9.1 3 10.5 3 12z"
      />
      <path
        fill="#FBBC05"
        d="M12 21c2.4 0 4.5-.8 6-2.2l-2.8-2.3c-.8.5-1.8.9-3.2.9-2.5 0-4.6-1.7-5.3-4.1L3.1 16.1C4.6 19.1 8 21 12 21z"
      />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export default function SocialAuthButtons({ redirect = '/' }: SocialAuthButtonsProps) {
  const [status, setStatus] = useState<{
    google: boolean
    github: boolean
    dbReady: boolean
  } | null>(null)

  useEffect(() => {
    fetchOAuthStatus().then(setStatus)
  }, [])

  const googleEnabled = status?.google ?? false
  const githubEnabled = status?.github ?? false
  const dbReady = status?.dbReady ?? false
  const anyEnabled = googleEnabled || githubEnabled

  if (status && !anyEnabled) {
    return (
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-200/90">
        OAuth no configurado en el servidor. Agrega las claves de Google y GitHub en el{' '}
        <code className="text-amber-100">.env</code> del backend.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {status && !status.dbReady && (
        <p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          <strong className="text-red-100">Migración OAuth pendiente.</strong> En Supabase → SQL Editor,
          ejecuta el archivo <code className="text-red-100">backend/src/config/oauth-migration.sql</code>.
          Sin esto Google/GitHub no pueden crear tu cuenta.
        </p>
      )}

      <button
        type="button"
        disabled={!googleEnabled || !dbReady}
        onClick={() => {
          window.location.href = getGoogleAuthUrl(redirect)
        }}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-surface-elevated px-4 py-3 text-sm font-semibold text-white transition-all hover:border-neon-red/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        Continuar con Google
      </button>

      <button
        type="button"
        disabled={!githubEnabled || !dbReady}
        onClick={() => {
          window.location.href = getGitHubAuthUrl(redirect)
        }}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-surface-elevated px-4 py-3 text-sm font-semibold text-white transition-all hover:border-neon-cyan/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GitHubIcon />
        Continuar con GitHub
      </button>

      {status && !githubEnabled && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/90">
          GitHub no está activo: falta{' '}
          <code className="text-amber-100">GITHUB_CLIENT_SECRET</code> en{' '}
          <code className="text-amber-100">backend/.env</code>. Genera el secret en GitHub →
          Settings → Developer settings → OAuth Apps → ShopFlow.
        </p>
      )}
    </div>
  )
}
