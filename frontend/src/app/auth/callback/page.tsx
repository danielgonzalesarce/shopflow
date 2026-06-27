import { Suspense } from 'react'
import OAuthCallbackClient from './OAuthCallbackClient'

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100vh-4.25rem)] items-center justify-center bg-[var(--background)]">
          <p className="text-slate-400">Cargando...</p>
        </div>
      }
    >
      <OAuthCallbackClient />
    </Suspense>
  )
}
