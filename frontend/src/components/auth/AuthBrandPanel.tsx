'use client'

import { ReactNode } from 'react'
import Logo from '@/components/ui/Logo'

const AUTH_BG = '/images/hero-ecommerce.jpg'

interface AuthBrandPanelProps {
  title: string
  description: string
  footer?: ReactNode
}

export default function AuthBrandPanel({
  title,
  description,
  footer
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden min-h-full w-1/2 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${AUTH_BG}')` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/90 via-neon-red/20 to-neon-cyan/20"
        aria-hidden
      />

      <div className="relative z-10">
        <Logo variant="white" size="lg" />
      </div>

      <div className="relative z-10 max-w-lg">
        <h2 className="text-4xl font-extrabold leading-tight text-white">{title}</h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-200">{description}</p>
        {footer && <div className="mt-8">{footer}</div>}
      </div>

      <p className="relative z-10 text-sm text-slate-400">© ShopFlow {new Date().getFullYear()}</p>
    </div>
  )
}
