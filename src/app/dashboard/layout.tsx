'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/')
      return
    }

    if (!role) return

    if (role === 'principal' && pathname !== '/dashboard') {
      router.push('/dashboard')
    }
    // Szülők maradhatnak a /dashboard oldalon
  }, [user, role, loading, router, pathname])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Betöltés...</div>
  }

  if (!user || !role) {
    return null
  }

  return children
}
