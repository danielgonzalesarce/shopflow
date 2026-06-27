import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-bold text-indigo-500">ShopFlow</p>
          <p className="mt-1 text-sm text-slate-500">
            © {currentYear} ShopFlow. Todos los derechos reservados.
          </p>
        </div>

        <nav className="flex flex-wrap gap-6 text-sm">
          <Link href="/productos" className="text-slate-600 transition-colors hover:text-indigo-500">
            Productos
          </Link>
          <Link href="/mis-pedidos" className="text-slate-600 transition-colors hover:text-indigo-500">
            Mis Pedidos
          </Link>
          <Link href="/auth/login" className="text-slate-600 transition-colors hover:text-indigo-500">
            Iniciar sesión
          </Link>
          <Link href="/auth/register" className="text-slate-600 transition-colors hover:text-indigo-500">
            Registrarse
          </Link>
        </nav>
      </div>
    </footer>
  )
}
