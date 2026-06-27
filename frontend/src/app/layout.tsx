import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    template: '%s | ShopFlow',
    default: 'ShopFlow - Tu E-commerce Full Stack'
  },
  description:
    'ShopFlow es tu tienda online de confianza. Compra electrónica, moda y hogar con precios en soles, envío rápido y checkout seguro.',
  keywords: ['ecommerce', 'tienda online', 'Perú', 'ShopFlow', 'compras'],
  authors: [{ name: 'ShopFlow' }],
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'ShopFlow',
    title: 'ShopFlow - Tu E-commerce Full Stack',
    description:
      'Compra electrónica, ropa y productos para el hogar con envío rápido en Perú.'
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                borderRadius: '0.75rem',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
              },
              success: {
                iconTheme: {
                  primary: '#6366f1',
                  secondary: '#ffffff'
                }
              }
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
