'use client'

import { FormEvent, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import api from '@/lib/axios'
import { getApiErrorMessage } from '@/lib/errors'
import type { ApiResponse, Category, Product } from '@/types'

interface ProductModalProps {
  open: boolean
  product: Product | null
  categories: Category[]
  onClose: () => void
  onSuccess: () => void
}

export default function ProductModal({
  open,
  product,
  categories,
  onClose,
  onSuccess
}: ProductModalProps) {
  const isEditing = Boolean(product)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && product) {
      setName(product.name)
      setDescription(product.description || '')
      setPrice(String(product.price))
      setStock(String(product.stock))
      setCategoryId(product.category_id || '')
      setPreviewUrl(product.image_url || null)
      setImageFile(null)
    } else if (open) {
      setName('')
      setDescription('')
      setPrice('')
      setStock('')
      setCategoryId(categories[0]?.id || '')
      setPreviewUrl(null)
      setImageFile(null)
    }
  }, [open, product, categories])

  useEffect(() => {
    if (!imageFile) return

    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const handleClose = () => {
    if (isSubmitting) return
    onClose()
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description.trim())
      formData.append('price', price)
      formData.append('stock', stock)
      formData.append('category_id', categoryId)

      if (imageFile) {
        formData.append('image', imageFile)
      }

      const config = {
        transformRequest: [
          (data: FormData, headers: Record<string, string>) => {
            delete headers['Content-Type']
            return data
          }
        ]
      }

      if (isEditing && product) {
        await api.put(`/products/${product.id}`, formData, config)
        toast.success('Producto actualizado')
      } else {
        await api.post('/products', formData, config)
        toast.success('Producto creado')
      }

      onSuccess()
      onClose()
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'No se pudo guardar el producto'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {isEditing ? 'Editar producto' : 'Agregar producto'}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <Input
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSubmitting}
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Precio (S/.)"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              disabled={isSubmitting}
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              step="1"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Categoría
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Imagen del producto
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              disabled={isSubmitting}
              className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-600"
            />
            {previewUrl && (
              <div className="relative mt-3 h-40 w-full overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={previewUrl}
                  alt="Vista previa"
                  fill
                  className="object-cover"
                  unoptimized={previewUrl.startsWith('blob:')}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="flex-1">
              {isEditing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
