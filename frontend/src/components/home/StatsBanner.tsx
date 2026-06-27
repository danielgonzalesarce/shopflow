'use client'

import Link from 'next/link'
import { Heart, Package, ShieldCheck, Users } from 'lucide-react'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

const highlights = [
  {
    icon: Package,
    value: '20+',
    label: 'Productos activos',
    description: 'Catálogo en electrónica, moda y hogar'
  },
  {
    icon: Users,
    value: '3',
    label: 'Categorías',
    description: 'Colecciones curadas para cada necesidad'
  },
  {
    icon: ShieldCheck,
    value: '100%',
    label: 'Compra segura',
    description: 'Checkout protegido y datos encriptados'
  },
  {
    icon: Heart,
    value: '24/7',
    label: 'Siempre abierto',
    description: 'Compra cuando quieras, desde cualquier lugar'
  }
]

export default function StatsBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-neon-red/90 via-[#7f1d1d] to-neon-red/80 px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-neon-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-neon-cyan/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <RevealOnScroll className="mb-12 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            ShopFlow en números
          </h2>
          <p className="mt-2 text-red-100">
            Una plataforma pensada para comprar fácil, rápido y con confianza.
          </p>
        </RevealOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, index) => {
            const Icon = item.icon

            return (
              <RevealOnScroll key={item.label} delay={index * 80} direction="scale">
                <div className="rounded-2xl border border-white/20 bg-black/20 p-6 text-center backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 hover:border-neon-cyan/40">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-neon-cyan/20">
                    <Icon className="h-6 w-6 text-neon-cyan" />
                  </div>
                  <p className="mt-4 text-3xl font-extrabold text-white">{item.value}</p>
                  <p className="mt-1 font-semibold text-red-100">{item.label}</p>
                  <p className="mt-2 text-sm text-red-200/90">{item.description}</p>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>

        <RevealOnScroll className="mt-10 text-center" delay={200}>
          <Link
            href="/auth/register"
            className="text-sm font-semibold text-neon-cyan underline-offset-4 hover:underline"
          >
            Únete gratis y empieza a comprar →
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  )
}
