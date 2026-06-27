import { BadgeCheck, Clock, Headphones, RefreshCw } from 'lucide-react'

const guarantees = [
  {
    icon: BadgeCheck,
    title: 'Productos verificados',
    description: 'Catálogo curado con descripciones, imágenes y stock en tiempo real.'
  },
  {
    icon: Clock,
    title: 'Atención rápida',
    description: 'Soporte para consultas sobre pedidos y estado de tu compra.'
  },
  {
    icon: RefreshCw,
    title: 'Compra flexible',
    description: 'Carrito y favoritos disponibles antes y después de registrarte.'
  },
  {
    icon: Headphones,
    title: 'Experiencia premium',
    description: 'Diseño pensado para comprar fácil desde celular o computadora.'
  }
]

export default function TrustSection() {
  return (
    <section className="border-y border-slate-200 bg-indigo-950 px-4 py-20 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            ¿Por qué elegir ShopFlow?
          </h2>
          <p className="mt-4 text-indigo-200">
            Tu tienda online con todo lo que necesitas para comprar con confianza.
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {guarantees.map(({ icon: Icon, title, description }) => (
            <div key={title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <Icon className="h-7 w-7 text-indigo-200" />
              </div>
              <h3 className="mt-5 text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-indigo-200/90">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
