'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, ShoppingBag, Truck } from 'lucide-react'
import RevealOnScroll from '@/components/ui/RevealOnScroll'

const faqGroups = [
  {
    id: 'compras',
    label: 'Compras',
    icon: ShoppingBag,
    items: [
      {
        question: '¿Necesito crear una cuenta para comprar?',
        answer:
          'Puedes explorar el catálogo, agregar al carrito y guardar favoritos como invitado. Para finalizar el pago y hacer seguimiento de tu pedido necesitas registrarte gratis.'
      },
      {
        question: '¿Los precios están en soles peruanos?',
        answer:
          'Sí, todos los precios del catálogo se muestran en soles (S/.) sin costos ocultos en el listado de productos.'
      },
      {
        question: '¿Cómo funciona la lista de favoritos?',
        answer:
          'Marca productos con el corazón para guardarlos. Si no has iniciado sesión, se guardan en tu navegador; al registrarte se sincronizan con tu cuenta.'
      },
      {
        question: '¿Puedo modificar mi carrito antes de pagar?',
        answer:
          'Sí. Desde el carrito puedes cambiar cantidades o eliminar productos en cualquier momento antes de ir al checkout.'
      }
    ]
  },
  {
    id: 'envios',
    label: 'Envíos y pagos',
    icon: Truck,
    items: [
      {
        question: '¿A qué ciudades hacen envíos?',
        answer:
          'Realizamos envíos a Lima Metropolitana y a las principales ciudades del Perú. El tiempo de entrega se confirma al completar tu compra.'
      },
      {
        question: '¿Qué métodos de pago aceptan?',
        answer:
          'El checkout está preparado para completar tu orden de forma segura. Los detalles de pago se confirman al momento de finalizar la compra.'
      },
      {
        question: '¿Cuánto tarda en llegar mi pedido?',
        answer:
          'Los tiempos varían según tu ubicación. Puedes revisar el estado de tu pedido en la sección Mis pedidos una vez confirmada la compra.'
      },
      {
        question: '¿Puedo devolver un producto?',
        answer:
          'Si tu pedido llega con algún inconveniente, contáctanos desde tu cuenta en Mis pedidos y te ayudamos con el proceso de soporte.'
      }
    ]
  },
  {
    id: 'cuenta',
    label: 'Cuenta y soporte',
    icon: HelpCircle,
    items: [
      {
        question: '¿Cómo creo mi cuenta?',
        answer:
          'Haz clic en Registrarse, completa tus datos y listo. También puedes crear cuenta al finalizar una compra desde el checkout.'
      },
      {
        question: '¿Dónde veo mis pedidos anteriores?',
        answer:
          'Inicia sesión y entra a Mis pedidos desde el menú de tu perfil. Allí verás el historial y el estado de cada orden.'
      },
      {
        question: 'Olvidé mi contraseña, ¿qué hago?',
        answer:
          'Usa la opción de recuperación en la página de inicio de sesión o crea una nueva cuenta con el mismo correo si aún no tienes pedidos asociados.'
      },
      {
        question: '¿ShopFlow tiene tienda física?',
        answer:
          'Somos una tienda 100% online. Toda la experiencia de compra, pago y seguimiento se realiza desde la web.'
      }
    ]
  }
]

export default function FaqSection() {
  const [activeGroup, setActiveGroup] = useState(faqGroups[0].id)
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const currentGroup = faqGroups.find((g) => g.id === activeGroup) ?? faqGroups[0]

  const handleGroupChange = (id: string) => {
    setActiveGroup(id)
    setOpenIndex(0)
  }

  return (
    <section className="bg-[var(--background)] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <RevealOnScroll className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-neon-red">
            Ayuda
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-slate-400">
            Encuentra respuestas sobre compras, envíos y tu cuenta en ShopFlow.
          </p>
        </RevealOnScroll>

        <RevealOnScroll className="mt-10" delay={100}>
          <div className="flex flex-wrap justify-center gap-2">
            {faqGroups.map((group) => {
              const Icon = group.icon
              const active = activeGroup === group.id

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => handleGroupChange(group.id)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-neon-red text-white shadow-md shadow-neon-red/30 neon-glow-red'
                      : 'border border-[var(--border)] bg-surface-elevated text-slate-400 hover:border-neon-red/40 hover:text-neon-red'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {group.label}
                </button>
              )
            })}
          </div>
        </RevealOnScroll>

        <div className="mt-8 space-y-3">
          {currentGroup.items.map((faq, index) => {
            const isOpen = openIndex === index

            return (
              <RevealOnScroll key={faq.question} delay={index * 60}>
                <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-surface transition-shadow hover:border-neon-red/30 hover:shadow-md hover:shadow-neon-red/5">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-semibold text-white">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-neon-cyan transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-[var(--border)] px-5 py-4 text-sm leading-relaxed text-slate-400">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
