import { Suspense } from 'react'
import ProductosCatalog from './ProductosCatalog'
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton'

export default function ProductosPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProductGridSkeleton count={6} />
        </div>
      }
    >
      <ProductosCatalog />
    </Suspense>
  )
}
