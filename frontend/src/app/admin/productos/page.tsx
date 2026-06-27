'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ImageOff, Loader2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import ProductModal from './ProductModal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import { formatPrice } from '@/lib/products'
import type { ApiResponse, Category, Product } from '@/types'

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get<ApiResponse<Product[]>>('/products/admin/all')
      setProducts(data.data)
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Error al cargar productos'))
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
    api
      .get<ApiResponse<Category[]>>('/products/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]))
  }, [loadProducts])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id)

    try {
      if (product.is_active) {
        await api.delete(`/products/${product.id}`)
        toast.success('Producto desactivado')
      } else {
        const formData = new FormData()
        formData.append('is_active', 'true')
        await api.put(`/products/${product.id}`, formData, {
          transformRequest: [
            (data: FormData, headers: Record<string, string>) => {
              delete headers['Content-Type']
              return data
            }
          ]
        })
        toast.success('Producto activado')
      }
      await loadProducts()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo cambiar el estado'))
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
          <p className="mt-2 text-slate-600">Gestión del catálogo completo</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar producto
        </Button>
      </div>

      <Card className="mt-8 overflow-hidden" padding="sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Imagen</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Categoría</th>
                  <th className="px-4 py-3 font-medium">Precio</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                      No hay productos registrados
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-slate-100">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-5 w-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {product.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {product.category?.name || '—'}
                      </td>
                      <td className="px-4 py-3">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            product.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant={product.is_active ? 'ghost' : 'secondary'}
                            onClick={() => handleToggleActive(product)}
                            disabled={togglingId === product.id}
                            isLoading={togglingId === product.id}
                          >
                            {product.is_active ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ProductModal
        open={modalOpen}
        product={editingProduct}
        categories={categories}
        onClose={() => setModalOpen(false)}
        onSuccess={loadProducts}
      />
    </div>
  )
}
