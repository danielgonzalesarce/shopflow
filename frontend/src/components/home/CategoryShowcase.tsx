import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProductGrid from '@/components/product/ProductGrid'
import { fetchCategories, fetchProducts } from '@/lib/products'

export default async function CategoryShowcase() {
  const categories = await fetchCategories()

  const showcases = await Promise.all(
    categories.map(async (category) => ({
      category,
      products: (await fetchProducts({ category: category.slug, limit: 4, page: 1 })).products
    }))
  )

  return (
    <section className="bg-slate-50 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-20">
        {showcases.map(({ category, products }) => {
          if (products.length === 0) return null

          return (
            <div key={category.id}>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="text-sm font-semibold uppercase tracking-wider text-indigo-600">
                    Colección
                  </span>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                    Lo mejor en {category.name}
                  </h2>
                  <p className="mt-2 text-slate-600">
                    Productos seleccionados de nuestra línea de {category.name.toLowerCase()}.
                  </p>
                </div>
                <Link
                  href={`/productos?category=${category.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Ver toda la categoría
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <ProductGrid products={products} />
            </div>
          )
        })}
      </div>
    </section>
  )
}
