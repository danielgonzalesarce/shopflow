import Link from 'next/link'
import { CheckCircle2, Package } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ExitoPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function CheckoutExitoPage({ searchParams }: ExitoPageProps) {
  const { orderId } = await searchParams

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[var(--background)] px-4 py-16">
      <Card className="w-full max-w-lg text-center" padding="lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/15">
          <CheckCircle2 className="h-12 w-12 text-emerald-400" />
        </div>

        <h1 className="mt-6 text-2xl font-extrabold text-white sm:text-3xl">
          ¡Pedido confirmado con éxito!
        </h1>

        <p className="mt-3 text-slate-400">
          Gracias por tu compra. Hemos recibido tu pedido y pronto comenzaremos a procesarlo.
        </p>

        {orderId && (
          <div className="mt-6 rounded-xl border border-[var(--border)] bg-surface px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-neon-cyan">
              ID de orden
            </p>
            <p className="mt-1 break-all font-mono text-sm text-white">
              #{orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/mis-pedidos">
            <Button className="w-full sm:w-auto">
              <Package className="mr-2 h-4 w-4" />
              Ver mis pedidos
            </Button>
          </Link>
          <Link href="/">
            <Button variant="secondary" className="w-full sm:w-auto">
              Seguir comprando
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
