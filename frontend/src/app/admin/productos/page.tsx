'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { ImageOff, Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import ProductModal from './ProductModal'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import { formatPrice } from '@/lib/products'
import { useAuthStore } from '@/store/auth.store'
import type { ApiResponse, Category, Product } from '@/types'

export default function AdminProductosPage() {
  const token = useAuthStore((state) => state.token)
  const isAuthLoading = useAuthStore((state) => state.isLoading)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
    if (isAuthLoading || !token) return

    loadProducts()
    api
      .get<ApiResponse<Category[]>>('/products/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => setCategories([]))
  }, [loadProducts, token, isAuthLoading])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setModalOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setModalOpen(true)
  }

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `¿Eliminar "${product.name}" del catálogo?\n\nEl producto se ocultará de la tienda pero se conservará en pedidos anteriores.`
    )

    if (!confirmed) return

    setDeletingId(product.id)

    try {
      await api.delete(`/products/${product.id}`)
      toast.success('Producto eliminado del catálogo')
      await loadProducts()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo eliminar el producto'))
    } finally {
      setDeletingId(null)
    }
  }

  const handleRestore = async (product: Product) => {
    setDeletingId(product.id)

    try {
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
      toast.success('Producto restaurado')
      await loadProducts()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo restaurar el producto'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
          <p className="mt-2 text-slate-600">Gestión del catálogo completo</p>
        </div>
        <Button onClick={handleAdd} disabled={categories.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Crear producto
        </Button>
      </div>

      {categories.length === 0 && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No hay categorías disponibles. Ejecuta el schema de la base de datos antes de crear productos.
        </p>
      )}

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
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="mr-1.5 h-3.5 w-3.5" />
                            Editar
                          </Button>
                          {product.is_active ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product.id}
                              isLoading={deletingId === product.id}
                              className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                              Eliminar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleRestore(product)}
                              disabled={deletingId === product.id}
                              isLoading={deletingId === product.id}
                            >
                              Restaurar
                            </Button>
                          )}
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
