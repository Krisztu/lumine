import './globals.css'
import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'

const outfit = Outfit({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Luminé - Oktatási Platform',
  description: 'Modern oktatási platform diákok és tanárok számára',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu" className="h-full">
      <body className={`${outfit.className} h-full min-h-screen`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}