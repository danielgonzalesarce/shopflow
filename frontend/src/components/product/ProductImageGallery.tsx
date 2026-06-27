'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface ProductImageGalleryProps {
  images: string[]
  alt: string
  priority?: boolean
  className?: string
}

export default function ProductImageGallery({
  images,
  alt,
  priority = false,
  className = ''
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set())

  const visibleImages = images.filter((_, index) => !failedIndexes.has(index))
  const safeIndex = Math.min(activeIndex, Math.max(visibleImages.length - 1, 0))
  const currentSrc = visibleImages[safeIndex]

  const handleError = (index: number) => {
    setFailedIndexes((prev) => new Set(prev).add(index))
  }

  if (!currentSrc) {
    return (
      <div
        className={`flex aspect-square flex-col items-center justify-center rounded-3xl border border-[var(--border)] bg-surface text-slate-500 ${className}`}
      >
        <ImageOff className="h-16 w-16" />
        <span className="mt-3 text-sm">Sin imagen disponible</span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--border)] bg-surface shadow-xl shadow-black/40">
        <Image
          key={currentSrc}
          src={currentSrc}
          alt={`${alt} — imagen ${safeIndex + 1}`}
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
          onError={() => handleError(safeIndex)}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((src, index) => {
            const isActive = index === safeIndex
            const failed = failedIndexes.has(index)

            return (
              <button
                key={`${src}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                disabled={failed}
                className={`relative aspect-square overflow-hidden rounded-xl border-2 bg-surface transition-all ${
                  isActive
                    ? 'border-neon-red ring-2 ring-neon-red/25'
                    : 'border-[var(--border)] hover:border-neon-red/50'
                } ${failed ? 'cursor-not-allowed opacity-40' : ''}`}
                aria-label={`Ver imagen ${index + 1} de ${alt}`}
                aria-pressed={isActive}
              >
                {!failed ? (
                  <Image
                    src={src}
                    alt={`${alt} miniatura ${index + 1}`}
                    fill
                    sizes="120px"
                    className="object-cover"
                    onError={() => handleError(index)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageOff className="h-5 w-5 text-slate-500" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
