'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Star } from 'lucide-react'
import Button from '@/components/ui/Button'
import RevealOnScroll from '@/components/ui/RevealOnScroll'
import { formatPrice, getProductImages } from '@/lib/products'
import type { Product } from '@/types'

const promoLabels = [
  'Destacado',
  'Oferta especial',
  'Top ventas',
  'Recomendado',
  'Nuevo ingreso',
  'Popular'
]

interface ProductSpotlightListProps {
  products: Product[]
}

function pseudoRating(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (4 + (hash % 10) / 10).toFixed(1)
}

function SpotlightRow({
  product,
  index,
  visible
}: {
  product: Product
  index: number
  visible: boolean
}) {
  const imageRight = index % 2 === 0
  const images = getProductImages(product)
  const imageSrc = images[0] || product.image_url
  const rating = pseudoRating(product.id)

  const content = (
    <div
      className={`flex flex-col justify-center transition-all duration-700 ease-out ${
        visible
          ? 'translate-x-0 opacity-100'
          : imageRight
            ? '-translate-x-10 opacity-0'
            : 'translate-x-10 opacity-0'
      } ${imageRight ? 'lg:pr-6' : 'lg:pl-6'}`}
    >
      <span className="inline-flex w-fit rounded-full bg-neon-red/15 px-3 py-1 text-xs font-semibold text-neon-red shadow-sm">
        {promoLabels[index % promoLabels.length]}
      </span>

      {product.category && (
        <span className="mt-4 inline-flex w-fit rounded-full bg-white/5 px-3 py-1 text-xs font-medium text-slate-400">
          {product.category.name}
        </span>
      )}

      <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        {product.name}
      </h3>

      <div className="mt-3 flex items-center gap-1.5">
        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
        <span className="text-sm font-bold text-slate-200">{rating}</span>
        <span className="text-sm text-slate-500">·</span>
        <span className="text-sm text-slate-400">
          {product.stock === 0 ? 'Agotado' : `${product.stock} en stock`}
        </span>
      </div>

      <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400">
        {product.description ||
          'Producto seleccionado del catálogo ShopFlow con envío a todo el Perú.'}
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <p
          className={`text-3xl font-extrabold text-white transition-transform duration-500 ${
            visible ? 'scale-100' : 'scale-90'
          }`}
        >
          {formatPrice(product.price)}
        </p>
        {product.stock > 0 && product.stock <= 10 && (
          <span className="animate-pulse rounded-lg bg-amber-500 px-2.5 py-1 text-xs font-bold text-white">
            Últimas unidades
          </span>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/productos/${product.id}`}>
          <Button size="lg" className="transition-transform hover:-translate-y-0.5">
            Ver producto
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        <Link href="/productos">
          <Button size="lg" variant="outline">
            Ver catálogo
          </Button>
        </Link>
      </div>
    </div>
  )

  const visual = (
    <Link
      href={`/productos/${product.id}`}
      className={`group relative block transition-all duration-700 ease-out ${
        visible
          ? 'translate-x-0 opacity-100'
          : imageRight
            ? 'translate-x-10 opacity-0'
            : '-translate-x-10 opacity-0'
      }`}
      style={{ transitionDelay: '120ms' }}
    >
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl bg-neon-red/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-surface shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:border-neon-red/40 group-hover:shadow-xl group-hover:shadow-neon-red/15">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt={product.name}
              width={800}
              height={600}
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          </>
        ) : (
          <div className="flex aspect-[4/3] items-center justify-center text-slate-400">
            Sin imagen
          </div>
        )}
        {product.category && (
          <span className="absolute left-4 top-4 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-neon-cyan shadow-sm backdrop-blur-sm">
            {product.category.name}
          </span>
        )}
        <span className="absolute bottom-4 right-4 translate-y-2 rounded-full bg-neon-red px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 neon-glow-red">
          Ver detalle →
        </span>
      </div>
    </Link>
  )

  return (
    <section
      className={`relative overflow-hidden py-16 sm:py-20 ${
        index % 2 === 0 ? 'bg-[var(--background)]' : 'bg-surface'
      }`}
    >
      <div
        className={`pointer-events-none absolute top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-neon-red/10 blur-3xl ${
          imageRight ? '-left-20' : '-right-20'
        }`}
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-14 lg:px-8">
        {imageRight ? (
          <>
            {content}
            {visual}
          </>
        ) : (
          <>
            {visual}
            {content}
          </>
        )}
      </div>
    </section>
  )
}

export default function ProductSpotlightList({ products }: ProductSpotlightListProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    const root = sectionRef.current
    if (!root) return

    const observers: IntersectionObserver[] = []

    root.querySelectorAll('[data-spotlight-index]').forEach((row) => {
      const index = Number(row.getAttribute('data-spotlight-index'))
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleRows((prev) => new Set(prev).add(index))
            observer.disconnect()
          }
        },
        { threshold: 0.15 }
      )
      observer.observe(row)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [products.length])

  if (products.length === 0) return null

  return (
    <div ref={sectionRef}>
      <RevealOnScroll className="border-b border-[var(--border)] bg-surface px-4 py-14 text-center sm:px-6 lg:px-8">
        <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
          Destacados
        </span>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Productos seleccionados
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-400">
          Conoce algunos de nuestros productos con más detalle antes de explorar el catálogo completo.
        </p>
      </RevealOnScroll>

      {products.map((product, index) => (
        <div key={product.id} data-spotlight-index={index}>
          <SpotlightRow product={product} index={index} visible={visibleRows.has(index)} />
        </div>
      ))}

      <RevealOnScroll className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-12 text-center">
        <Link href="/productos">
          <Button size="lg">
            Ver catálogo completo
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </RevealOnScroll>
    </div>
  )
}
