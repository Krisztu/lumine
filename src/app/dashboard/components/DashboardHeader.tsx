'use client'

import { Button } from '@/shared/components/ui/button'
import { Sun, Moon, LogOut } from 'lucide-react'

interface DashboardHeaderProps {
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  cookieConsent: boolean
  currentUser: any
  userRole: string
  user: any
  onLogout: () => void
}

export function DashboardHeader({
  darkMode,
  setDarkMode,
  cookieConsent,
  currentUser,
  userRole,
  user,
  onLogout
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-sm sm:text-lg">L</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-gradient">Luminé</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const newDarkMode = !darkMode
                setDarkMode(newDarkMode)
                document.documentElement.classList.toggle('dark', newDarkMode)
                if (cookieConsent) {
                  localStorage.setItem('darkMode', newDarkMode.toString())
                }
              }}
              className="rounded-full hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <div className="hidden md:flex flex-col items-end mr-2">
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {currentUser?.name || currentUser?.fullName || user.email}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentUser?.role === 'dj' && 'DJ'}
                {currentUser?.role === 'teacher' && 'Tanár'}
                {currentUser?.role === 'homeroom_teacher' && 'Osztályfőnök'}
                {currentUser?.role === 'admin' && 'Admin'}
                {currentUser?.role === 'student' && 'Diák'}
                {currentUser?.role === 'principal' && 'Igazgató'}
                {currentUser?.role === 'parent' && 'Szülő'}
              </span>
            </div>
            <Button variant="destructive" size="sm" onClick={onLogout} className="rounded-full shadow-md text-xs sm:text-sm px-2 sm:px-4">
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
              <span className="hidden sm:inline">Kilépés</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
