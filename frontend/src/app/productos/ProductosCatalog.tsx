'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Filter, Search, SlidersHorizontal } from 'lucide-react'
import api from '@/lib/axios'
import { filterProductsByPrice } from '@/lib/products'
import ProductGrid from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { ApiResponse, Category, Product } from '@/types'

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  totalPages: number
}

export default function ProductosCatalog() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const category = searchParams.get('category') || ''
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') || '1')
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  const [searchInput, setSearchInput] = useState(search)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, value)
        }
      })

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [pathname, router, searchParams]
  )

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        updateParams({ search: searchInput || null, page: '1' })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput, search, updateParams])

  useEffect(() => {
    async function loadCategories() {
      try {
        const { data } = await api.get<ApiResponse<Category[]>>('/products/categories')
        setCategories(data.data)
      } catch {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true)

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: '12'
        })

        if (category) params.set('category', category)
        if (search) params.set('search', search)

        const { data } = await api.get<ApiResponse<ProductsResponse>>(
          `/products?${params.toString()}`
        )

        const min = minPrice ? Number(minPrice) : undefined
        const max = maxPrice ? Number(maxPrice) : undefined

        const filtered = filterProductsByPrice(data.data.products, min, max)

        setProducts(filtered)
        setTotalPages(data.data.totalPages)
        setTotal(data.data.total)
      } catch {
        setProducts([])
        setTotalPages(0)
        setTotal(0)
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [category, search, page, minPrice, maxPrice])

  const toggleCategory = (slug: string) => {
    updateParams({
      category: category === slug ? null : slug,
      page: '1'
    })
  }

  const activeCategoryName = categories.find((c) => c.slug === category)?.name

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="border-b border-[var(--border)] bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
            Catálogo
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {activeCategoryName ? activeCategoryName : 'Todos los productos'}
          </h1>
          <p className="mt-2 text-slate-400">
            {total > 0
              ? `${total} productos disponibles`
              : 'Explora nuestra selección y encuentra lo que necesitas'}
          </p>

          <div className="relative mt-8">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Buscar por nombre o descripción..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-surface-elevated py-4 pl-12 pr-4 text-white shadow-sm transition-all placeholder:text-slate-500 focus:border-neon-red focus:bg-surface focus:outline-none focus:ring-4 focus:ring-neon-red/15"
              aria-label="Buscar productos"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <button
          onClick={() => setFiltersOpen((prev) => !prev)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-surface-elevated px-4 py-2.5 text-sm font-semibold text-slate-300 shadow-sm lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside
            className={`w-full shrink-0 lg:block lg:w-72 ${filtersOpen ? 'block' : 'hidden'}`}
          >
            <div className="sticky top-24 rounded-2xl border border-[var(--border)] bg-surface-elevated p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-neon-red" />
                <h2 className="text-lg font-bold text-white">Filtros</h2>
              </div>

              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Categorías
                </h3>
                <div className="mt-3 flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                  {categories.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => toggleCategory(item.slug)}
                      className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-all ${
                        category === item.slug
                          ? 'bg-neon-red text-white shadow-md shadow-neon-red/30'
                          : 'bg-white/5 text-slate-300 hover:bg-neon-red/10 hover:text-neon-red'
                      }`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Precio (S/.)
                </h3>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <Input
                    label="Mínimo"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={minPrice}
                    onChange={(event) =>
                      updateParams({ minPrice: event.target.value || null, page: '1' })
                    }
                  />
                  <Input
                    label="Máximo"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="999.99"
                    value={maxPrice}
                    onChange={(event) =>
                      updateParams({ maxPrice: event.target.value || null, page: '1' })
                    }
                  />
                </div>
              </div>

              {(category || minPrice || maxPrice || search) && (
                <button
                  onClick={() => router.push(pathname)}
                  className="mt-6 w-full rounded-xl bg-white/5 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          </aside>

          <div className="flex-1">
            {isLoading ? (
              <ProductGridSkeleton count={6} />
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] bg-surface py-20 text-center">
                <Search className="h-12 w-12 text-slate-600" />
                <h3 className="mt-4 text-lg font-bold text-white">Sin resultados</h3>
                <p className="mt-2 text-sm text-slate-400">
                  Prueba con otros filtros o términos de búsqueda
                </p>
                <Button
                  variant="outline"
                  className="mt-6"
                  onClick={() => router.push(pathname)}
                >
                  Ver todos los productos
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid products={products} />

                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => updateParams({ page: String(page - 1) })}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <span className="rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => updateParams({ page: String(page + 1) })}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
