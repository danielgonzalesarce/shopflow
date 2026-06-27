'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ChevronRight,
  CreditCard,
  Minus,
  Package,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck
} from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import WishlistButton from '@/components/favorites/WishlistButton'
import ProductCard from '@/components/product/ProductCard'
import ProductImageGallery from '@/components/product/ProductImageGallery'
import { formatPrice, getProductImages } from '@/lib/products'
import { getApiErrorMessage } from '@/lib/errors'
import { useCartStore } from '@/store/cart.store'
import { useUiStore } from '@/store/ui.store'
import type { Product } from '@/types'

interface ProductDetailViewProps {
  product: Product
  relatedProducts: Product[]
}

function pseudoRating(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return (4 + (hash % 10) / 10).toFixed(1)
}

function pseudoReviewCount(id: string) {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return 12 + (hash % 48)
}

const trustBadges = [
  { icon: Truck, label: 'Envío a todo el Perú', detail: 'Lima y provincias' },
  { icon: ShieldCheck, label: 'Compra segura', detail: 'Datos protegidos' },
  { icon: RotateCcw, label: 'Soporte postventa', detail: 'Te ayudamos si algo falla' },
  { icon: CreditCard, label: 'Pago confiable', detail: 'Checkout verificado' }
]

type InfoTab = 'descripcion' | 'envio' | 'especificaciones'

export default function ProductDetailView({
  product,
  relatedProducts
}: ProductDetailViewProps) {
  const addItem = useCartStore((state) => state.addItem)
  const setCartOpen = useUiStore((state) => state.setCartOpen)

  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<InfoTab>('descripcion')

  const images = getProductImages(product)
  const outOfStock = product.stock === 0
  const lowStock = product.stock > 0 && product.stock < 5
  const rating = pseudoRating(product.id)
  const reviewCount = pseudoReviewCount(product.id)
  const ratingNum = parseFloat(rating)

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta
      if (next < 1) return 1
      if (next > product.stock) return product.stock
      return next
    })
  }

  const handleAddToCart = async () => {
    if (outOfStock) return

    setIsAdding(true)

    try {
      await addItem(product, quantity)
      toast.success('Producto agregado al carrito')
      setCartOpen(true)
      setQuantity(1)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo agregar al carrito'))
    } finally {
      setIsAdding(false)
    }
  }

  const specs = [
    { label: 'Categoría', value: product.category?.name ?? 'General' },
    { label: 'Disponibilidad', value: outOfStock ? 'Agotado' : `${product.stock} unidades` },
    { label: 'Precio unitario', value: formatPrice(product.price) },
    { label: 'Código', value: product.id.slice(0, 8).toUpperCase() },
    { label: 'Imágenes', value: `${images.length} foto${images.length === 1 ? '' : 's'}` },
    { label: 'Moneda', value: 'Soles peruanos (S/.)' }
  ]

  const tabs: { id: InfoTab; label: string }[] = [
    { id: 'descripcion', label: 'Descripción' },
    { id: 'envio', label: 'Envío' },
    { id: 'especificaciones', label: 'Especificaciones' }
  ]

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-neon-cyan">
            Inicio
          </Link>
          <span className="text-slate-600">/</span>
          <Link href="/productos" className="transition-colors hover:text-neon-cyan">
            Productos
          </Link>
          {product.category && (
            <>
              <span className="text-slate-600">/</span>
              <Link
                href={`/productos?category=${product.category.slug}`}
                className="transition-colors hover:text-neon-cyan"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span className="text-slate-600">/</span>
          <span className="font-medium text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <ProductImageGallery images={images} alt={product.name} priority />
            <div className="absolute right-4 top-4 z-10">
              <WishlistButton product={product} />
            </div>
          </div>

          <div className="flex flex-col">
            {product.category && (
              <span className="mb-4 inline-flex w-fit rounded-full border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-1 text-sm font-semibold text-neon-cyan">
                {product.category.name}
              </span>
            )}

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(ratingNum)
                        ? 'fill-amber-400 text-amber-400'
                        : i < ratingNum
                          ? 'fill-amber-400/50 text-amber-400/50'
                          : 'fill-slate-700 text-slate-700'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-white">{rating}</span>
              <span className="text-sm text-slate-500">·</span>
              <span className="text-sm text-slate-400">{reviewCount} valoraciones</span>
            </div>

            <p className="mt-6 text-4xl font-extrabold tracking-tight text-neon-cyan">
              {formatPrice(product.price)}
            </p>
            <p className="mt-1 text-sm text-slate-400">Precio en soles peruanos, IGV incluido</p>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {trustBadges.map(({ icon: Icon, label, detail }) => (
                <div
                  key={label}
                  className="rounded-xl border border-[var(--border)] bg-surface-elevated p-3 text-center"
                >
                  <Icon className="mx-auto h-5 w-5 text-neon-red" />
                  <p className="mt-2 text-xs font-semibold text-white">{label}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-surface p-4">
              {outOfStock ? (
                <p className="text-sm font-semibold text-red-400">Producto agotado</p>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-neon-cyan" />
                    <p className="text-sm text-slate-300">
                      Stock disponible:{' '}
                      <span className="font-bold text-white">{product.stock} unidades</span>
                    </p>
                  </div>
                  {lowStock && (
                    <p className="mt-2 text-sm font-semibold text-amber-400">
                      ¡Últimas unidades disponibles!
                    </p>
                  )}
                </>
              )}
            </div>

            {!outOfStock && (
              <div className="mt-6">
                <label htmlFor="quantity" className="mb-2 block text-sm font-semibold text-slate-200">
                  Cantidad
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-surface-elevated text-white transition-colors hover:border-neon-red/50 hover:bg-neon-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min={1}
                    max={product.stock}
                    value={quantity}
                    onChange={(event) => {
                      const value = parseInt(event.target.value, 10)
                      if (Number.isNaN(value)) return
                      setQuantity(Math.min(Math.max(value, 1), product.stock))
                    }}
                    className="w-24 rounded-xl border border-[var(--border)] bg-surface px-3 py-2.5 text-center font-semibold text-white focus:border-neon-red focus:outline-none focus:ring-2 focus:ring-neon-red/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-surface-elevated text-white transition-colors hover:border-neon-red/50 hover:bg-neon-red/10 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-slate-400">
                    Total:{' '}
                    <span className="font-bold text-neon-cyan">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="w-full sm:flex-1"
                onClick={handleAddToCart}
                disabled={outOfStock}
                isLoading={isAdding}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
              <Link href="/productos" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full">
                  Seguir comprando
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <section className="mt-16 rounded-2xl border border-[var(--border)] bg-surface overflow-hidden">
          <div className="flex flex-wrap border-b border-[var(--border)]">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-4 text-sm font-semibold transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-neon-red bg-neon-red/10 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'descripcion' && (
              <div>
                <h2 className="text-lg font-bold text-white">Sobre este producto</h2>
                <p className="mt-4 text-base leading-relaxed text-slate-300">
                  {product.description || 'Sin descripción disponible para este producto.'}
                </p>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    'Producto verificado en catálogo ShopFlow',
                    'Imágenes reales del artículo',
                    'Garantía de satisfacción del comprador',
                    'Soporte por correo y desde tu cuenta'
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neon-red" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'envio' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-white">Envío y entrega</h2>
                  <p className="mt-3 text-slate-300 leading-relaxed">
                    Realizamos envíos a Lima Metropolitana y a las principales ciudades del Perú.
                    El tiempo estimado se confirma al completar tu compra en el checkout.
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { title: 'Lima', time: '2–4 días hábiles' },
                    { title: 'Costa', time: '3–6 días hábiles' },
                    { title: 'Sierra / Selva', time: '5–8 días hábiles' }
                  ].map((zone) => (
                    <div
                      key={zone.title}
                      className="rounded-xl border border-[var(--border)] bg-surface-elevated p-4"
                    >
                      <p className="font-semibold text-white">{zone.title}</p>
                      <p className="mt-1 text-sm text-neon-cyan">{zone.time}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500">
                  Seguimiento disponible en la sección Mis pedidos una vez confirmada la compra.
                </p>
              </div>
            )}

            {activeTab === 'especificaciones' && (
              <div>
                <h2 className="text-lg font-bold text-white">Ficha técnica</h2>
                <dl className="mt-4 divide-y divide-[var(--border)] rounded-xl border border-[var(--border)]">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <dt className="text-sm font-medium text-slate-400">{spec.label}</dt>
                      <dd className="text-sm font-semibold text-white">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </section>

        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-[var(--border)] pt-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
                  También te puede gustar
                </span>
                <h2 className="mt-1 text-2xl font-bold text-white">Productos relacionados</h2>
              </div>
              {product.category && (
                <Link
                  href={`/productos?category=${product.category.slug}`}
                  className="hidden text-sm font-medium text-neon-cyan transition-colors hover:text-neon-cyan-light sm:flex sm:items-center sm:gap-1"
                >
                  Ver más en {product.category.name}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((related) => (
                <ProductCard key={related.id} product={related} />
              ))}
            </div>
            {product.category && (
              <Link
                href={`/productos?category=${product.category.slug}`}
                className="mt-6 flex items-center justify-center gap-1 text-sm font-medium text-neon-cyan sm:hidden"
              >
                Ver más en {product.category.name}
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </section>
        )}
      </div>
    </div>
  )
}
