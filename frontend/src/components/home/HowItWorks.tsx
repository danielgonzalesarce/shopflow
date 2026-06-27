'use client'

import Link from 'next/link'
import { CreditCard, Package, Search, Truck } from 'lucide-react'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

const steps = [
  {
    icon: Search,
    step: '01',
    title: 'Explora el catálogo',
    description: 'Filtra por categoría, precio o busca el producto que necesitas en segundos.'
  },
  {
    icon: Package,
    step: '02',
    title: 'Agrega al carrito',
    description: 'Guarda tus favoritos y arma tu pedido sin necesidad de registrarte al inicio.'
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Paga con seguridad',
    description: 'Checkout rápido con cuenta verificada y confirmación inmediata de tu compra.'
  },
  {
    icon: Truck,
    step: '04',
    title: 'Recibe en casa',
    description: 'Seguimiento del pedido y entrega a Lima y principales ciudades del Perú.'
  }
]

export default function HowItWorks() {
  return (
    <section className="section-gradient px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
            Cómo funciona
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Comprar en ShopFlow es muy fácil
          </h2>
          <p className="mt-4 text-slate-400">
            Cuatro pasos simples para llevarte lo que necesitas desde la pantalla hasta tu puerta.
          </p>
        </RevealOnScroll>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, step, title, description }, index) => (
            <RevealOnScroll key={step} delay={index * 100} direction="up">
              <div className="group h-full rounded-2xl border border-[var(--border)] bg-surface-elevated p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neon-red/40 hover:shadow-lg hover:shadow-neon-red/10">
                <span className="text-4xl font-extrabold text-neon-red/20 transition-colors group-hover:text-neon-red/40">
                  {step}
                </span>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-xl bg-neon-red text-white transition-transform duration-300 group-hover:scale-110 neon-glow-red">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>

        <RevealOnScroll className="mt-12 text-center" delay={200}>
          <Link
            href="/productos"
            className="text-sm font-semibold text-neon-cyan transition-colors hover:text-neon-cyan-light"
          >
            Empezar a comprar →
          </Link>
        </RevealOnScroll>
      </div>
    </section>
  )
}
