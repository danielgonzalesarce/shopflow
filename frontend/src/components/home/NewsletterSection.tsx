'use client'

import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

export default function NewsletterSection() {
  return (
    <section className="bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll direction="scale">
          <div className="overflow-hidden rounded-3xl border border-neon-red/30 bg-surface-elevated p-8 shadow-sm shadow-neon-red/10 sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-12">
            <div className="max-w-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neon-red/15 text-neon-red">
                <Mail className="h-6 w-6" />
              </div>
              <h2 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">
                No te pierdas las novedades
              </h2>
              <p className="mt-3 text-slate-400">
                Crea tu cuenta para guardar favoritos, recibir actualizaciones de pedidos y
                acceder a ofertas del catálogo antes que nadie.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Crear cuenta gratis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/productos">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Explorar productos
                </Button>
              </Link>
            </div>
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
