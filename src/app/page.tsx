'use client'

import { useState, useEffect } from 'react'
import { GlassCard } from '@/shared/components/ui/glass-card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { LoadingScreen } from '@/shared/components/ui/loading-screen'
import { GraduationCap, ArrowRight, Sparkles, Sun, Moon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [darkMode, setDarkMode] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)
  const { signIn, user, error: authError, role, loading: authLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Sötét mód alapértelmezett beállítása
    try {
      const savedDarkMode = localStorage.getItem('darkMode')
      const isDark = savedDarkMode !== null ? savedDarkMode === 'true' : true
      setDarkMode(isDark)
      document.documentElement.classList.toggle('dark', isDark)
      // Ha nincs mentés, akkor mentjük el az alapértelmezettet
      if (savedDarkMode === null) {
        localStorage.setItem('darkMode', 'true')
      }
    } catch (error) {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  useEffect(() => {
    if (user && role && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, role, authLoading, router])

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Email és jelszó szükséges')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
    } catch (error: any) {
      setError(error.message || 'Bejelentkezési hiba történt')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !mounted) {
    return <LoadingScreen message="Betöltés..." />
  }

  // Ha a felhasználó be van jelentkezve, ne rendereljük a login oldalt
  if (user && role) {
    return <LoadingScreen message="Átirányítás..." />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-3 sm:p-4 relative overflow-hidden">
      {/* Sötét/világos mód kapcsoló */}
      {mounted && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="rounded-full hover:bg-white/10 w-8 h-8 sm:w-10 sm:h-10"
          >
            {darkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
          </Button>
        </div>
      )}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl mb-3 sm:mb-4 group hover:scale-110 transition-transform duration-300">
            <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-primary group-hover:text-blue-500 transition-colors" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-gradient pb-2">Luminé</h1>
          <p className="text-sm sm:text-lg text-muted-foreground font-medium px-2 text-center">Békéscsabai SZC Nemes Tihamér Technikum</p>
        </div>

        <GlassCard variant="panel" className="border-t-white/40">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground/80 font-medium ml-1 text-sm">Email cím</Label>
              <Input
                id="email"
                type="email"
                placeholder="pelda@iskola.hu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="glass-input h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground/80 font-medium ml-1 text-sm">Jelszó</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
                className="glass-input h-10 sm:h-11 text-sm sm:text-base"
              />
            </div>

            {(error || authError) && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm text-center font-medium animate-shake">
                {error || authError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-10 sm:h-12 text-sm sm:text-lg font-semibold glass-button mt-4 sm:mt-6 group"
            >
              {loading ? (
                <Sparkles className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              ) : (
                <span className="flex items-center">
                  Bejelentkezés
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>
        </GlassCard>

        <p className="text-center text-xs sm:text-sm text-muted-foreground px-2">
          &copy; {new Date().getFullYear()} Luminé Platform. Minden jog fenntartva.
        </p>
      </div>
    </div>
  )
}
