import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface ExitoPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function CheckoutExitoPage({ searchParams }: ExitoPageProps) {
  const { orderId } = await searchParams

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16">
      <Card className="w-full text-center" padding="lg">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-12 w-12 text-green-500" />
        </div>

        <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
          ¡Pedido confirmado con éxito!
        </h1>

        <p className="mt-3 text-slate-600">
          Gracias por tu compra. Hemos recibido tu pedido y pronto comenzaremos a
          procesarlo.
        </p>

        {orderId && (
          <div className="mt-6 rounded-lg bg-slate-50 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              ID de orden
            </p>
            <p className="mt-1 break-all font-mono text-sm text-slate-900">{orderId}</p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/mis-pedidos">
            <Button className="w-full sm:w-auto">Ver mis pedidos</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Seguir comprando
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
