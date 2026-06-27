'use client'

import { Star } from 'lucide-react'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

const reviews = [
  {
    name: 'María L.',
    city: 'Lima',
    text: 'Encontré audífonos y accesorios a mejor precio que en otras tiendas. El envío llegó antes de lo esperado.',
    rating: 5
  },
  {
    name: 'Carlos R.',
    city: 'Arequipa',
    text: 'Me gusta que puedo armar el carrito sin registrarme y pagar después. La experiencia es muy fluida.',
    rating: 5
  },
  {
    name: 'Andrea V.',
    city: 'Trujillo',
    text: 'Variedad en electrónica y hogar. Los productos llegaron bien empacados y tal como en las fotos.',
    rating: 5
  },
  {
    name: 'Diego M.',
    city: 'Cusco',
    text: 'Compré varios artículos para el hogar. Atención rápida y precios claros en soles peruanos.',
    rating: 4
  }
]

export default function Testimonials() {
  return (
    <section className="bg-surface px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <RevealOnScroll className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
            Opiniones
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-4 text-slate-400">
            Compradores de todo el Perú confían en ShopFlow para sus compras online.
          </p>
        </RevealOnScroll>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reviews.map((review, index) => (
            <RevealOnScroll key={review.name} delay={index * 80} direction="up">
              <article className="flex h-full flex-col rounded-2xl border border-[var(--border)] bg-surface-elevated p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neon-red/40 hover:shadow-lg hover:shadow-neon-red/10">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-700 text-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-400">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="mt-5 border-t border-[var(--border)] pt-4">
                  <p className="font-bold text-white">{review.name}</p>
                  <p className="text-xs text-slate-500">{review.city}</p>
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
