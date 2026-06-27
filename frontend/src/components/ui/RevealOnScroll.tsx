'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'scale'

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  direction?: RevealDirection
  delay?: number
  duration?: number
}

const hiddenClasses: Record<RevealDirection, string> = {
  up: 'translate-y-8 opacity-0',
  down: '-translate-y-8 opacity-0',
  left: '-translate-x-8 opacity-0',
  right: 'translate-x-8 opacity-0',
  scale: 'scale-95 opacity-0'
}

export default function RevealOnScroll({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 600
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-all ease-out ${visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : hiddenClasses[direction]} ${className}`}
      style={{ transitionDuration: `${duration}ms`, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
