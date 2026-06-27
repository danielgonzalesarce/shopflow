'use client'

import { usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isAuth = pathname.startsWith('/auth')
  const isHome = pathname === '/'

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      <main className={`flex-1 ${isHome ? '' : 'pt-16'}`}>{children}</main>
      {!isAuth && <Footer />}
      <CartDrawer />
    </>
  )
}
