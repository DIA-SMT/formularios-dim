import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Formularios Digitales | DIM — San Miguel de Tucumán',
  description: 'Plataforma de formularios digitales de la Dirección de Ingresos Municipales (DIM) de la Municipalidad de San Miguel de Tucumán.',
  generator: 'v0.app',
  icons: {
    icon: '/logoMuni-sm.png',
    apple: '/logoMuni-sm.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es-AR">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
