'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Button } from '@/shared/components/ui/button'
import { LoadingScreen } from '@/shared/components/ui/loading-screen'
import { Mail, Lock, ArrowRight, Sun, Moon, Loader2 } from 'lucide-react'
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
    
    // Alapértelmezett beállítás a korábbi választás vagy rendszerpreferencia alapján
    const savedMode = localStorage.getItem('loginDarkMode')
    if (savedMode !== null) {
      const isDark = savedMode === 'true'
      setDarkMode(isDark)
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } else {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('loginDarkMode', String(newMode))
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  useEffect(() => {
    if (user && role && !authLoading) {
      router.push('/dashboard')
    }
  }, [user, role, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('A továbblépéshez add meg az email címed és a jelszavad.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await signIn(email, password)
    } catch (error: any) {
      setError(error.message || 'Hiba történt a bejelentkezés során. Próbáld újra.')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !mounted) {
    return <LoadingScreen message="Betöltés..." />
  }

  if (user && role) {
    return <LoadingScreen message="Átirányítás..." />
  }

  return (
    <div className={`min-h-screen flex selection:bg-emerald-500/30 transition-colors duration-500 ${darkMode ? 'bg-[#050505] text-white' : 'bg-[#fcfcfc] text-zinc-900'}`}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className={`fixed top-6 right-6 z-50 p-3 rounded-full transition-all duration-300 shadow-lg ${darkMode ? 'bg-zinc-800 text-white hover:bg-zinc-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
      >
        {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      {/* Bal oldal - Bejelentkező form */}
      <div className={`w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative z-10 transition-colors duration-500 ${darkMode ? 'bg-[#050505] border-r border-white/5' : 'bg-white border-r border-zinc-200'} shadow-2xl`}>
        <div className="w-full max-w-sm mx-auto space-y-10">
          
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              <img 
                src="/LuminéLogo.png" 
                alt="Luminé" 
                className="h-14 w-auto drop-shadow-[0_0_8px_rgba(16,185,129,0.3)] transition-transform duration-300 group-hover:scale-110"
              />
              <span className={`text-3xl font-bold tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Luminé</span>
            </div>
            
            <div className="pt-4">
              <h1 className={`text-4xl font-semibold tracking-tight mb-2 transition-colors duration-500 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>Bejelentkezés</h1>
              <p className={`text-sm transition-colors duration-500 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Békéscsabai SZC Nemes Tihamér Technikum</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Email cím</Label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-500 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="pelda@iskola.hu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className={`pl-11 h-12 border transition-all duration-500 ${darkMode ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-500'} focus-visible:ring-1 rounded-lg`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-500 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>Jelszó</Label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-500 ${darkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className={`pl-11 h-12 border transition-all duration-500 ${darkMode ? 'bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-emerald-500'} focus-visible:ring-1 rounded-lg`}
                />
              </div>
            </div>

            {(error || authError) && (
               <div className="text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1">
                {error || authError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/20 active:scale-[0.98]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Bejelentkezés <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <div className="pt-8 flex items-center justify-between">
            <p className={`text-xs transition-colors duration-500 ${darkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
               &copy; {new Date().getFullYear()} Luminé Platform.
            </p>
            <div className={`h-px flex-1 mx-4 transition-colors duration-500 ${darkMode ? 'bg-zinc-800' : 'bg-zinc-100'}`}></div>
          </div>
        </div>
      </div>

      {/* Jobb oldal - Vizuális rész (desktopon) */}
      <div className={`hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden transition-colors duration-500 ${darkMode ? 'bg-[#0A0A0A]' : 'bg-zinc-50'}`}>
        {/* Diszkrét, modern geometriai/absztrakt háttér sötét tónusokkal */}
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 transition-colors duration-500 ${darkMode ? 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]' : 'bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)]'} bg-[size:24px_24px]`}></div>
          <div className={`absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 transition-opacity duration-500 ${darkMode ? 'opacity-[0.05]' : 'opacity-[0.03]'} blur-[100px]`}></div>
        </div>
        
        <div className="relative z-10 max-w-lg p-12 text-center lg:text-left">
          <h2 className={`text-4xl font-light leading-tight tracking-tight transition-colors duration-500 ${darkMode ? 'text-white' : 'text-zinc-900'}`}>
            Egyszerű, határozott <br/>
            <span className="font-bold text-emerald-500">interaktív élmény.</span>
          </h2>
          <p className={`mt-6 font-light leading-relaxed transition-colors duration-500 ${darkMode ? 'text-zinc-400' : 'text-zinc-500'}`}>
            Lépj be a Luminé oktatási platformba, ahol minden tananyagot és feladatot egy helyen érsz el. Letisztult design, gyors működés.
          </p>
          
          <div className="mt-10 grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-100 shadow-sm'}`}>
              <div className="text-emerald-500 font-bold text-xl mb-1">100%</div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Digitalizált</p>
            </div>
            <div className={`p-4 rounded-2xl border transition-all duration-500 ${darkMode ? 'bg-white/5 border-white/5' : 'bg-white border-zinc-100 shadow-sm'}`}>
              <div className="text-emerald-500 font-bold text-xl mb-1">24/7</div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Elérhetőség</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
