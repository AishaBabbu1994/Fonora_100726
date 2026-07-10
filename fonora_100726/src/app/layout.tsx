import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'LexiVoz · Lector Interactivo',
  description: 'Lector de texto con voz interactiva, clic por palabra, IA y todas las voces del sistema.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}
