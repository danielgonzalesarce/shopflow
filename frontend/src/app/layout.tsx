import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import AuthProvider from '@/components/providers/AuthProvider'
import AppShell from '@/components/layout/AppShell'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap'
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
    <html lang="es" className={`${jakarta.variable} h-full scroll-smooth`}>
      <body className="flex min-h-full flex-col bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <AuthProvider>
          <AppShell>{children}</AppShell>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#16162a',
                color: '#f1f5f9',
                border: '1px solid #2a2a3d',
                borderRadius: '0.875rem',
                boxShadow: '0 10px 40px -10px rgb(0 0 0 / 0.5)',
                fontSize: '0.875rem',
                fontWeight: 500
              },
              success: {
                iconTheme: {
                  primary: '#e53935',
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
