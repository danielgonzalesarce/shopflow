'use client'

import { ReactNode } from 'react'
import Logo from '@/components/ui/Logo'

interface AuthFormShellProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export default function AuthFormShell({ title, subtitle, children, footer }: AuthFormShellProps) {
  return (
    <div className="flex w-full flex-col justify-center px-4 py-10 sm:px-8 lg:w-1/2 lg:px-12 xl:px-16">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <Logo size="lg" />
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-surface p-6 shadow-xl shadow-black/30 sm:p-8">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-neon-red">
              ShopFlow
            </span>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
          </div>

          {children}
        </div>

        {footer && <div className="mt-6 text-center">{footer}</div>}
      </div>
    </div>
  )
}
