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
    
    // Alapértelmezetten force dark mode a bejelentkező felületen a modern megjelenéshez
    try {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
      localStorage.setItem('darkMode', 'true')
    } catch (error) {
      // Ignored
    }
  }, [])

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
    <div className="min-h-screen flex text-foreground bg-[#050505] selection:bg-emerald-500/30">
      
      {/* Bal oldal - Bejelentkező form */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative z-10 bg-[#050505] border-r border-white/5 shadow-2xl">
        <div className="w-full max-w-sm mx-auto space-y-10">
          
          <div className="space-y-2">
            <img 
              src="/LuminéLogo.png" 
              alt="Luminé" 
              className="h-10 w-auto mb-16 opacity-90"
            />
            <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">Bejelentkezés</h1>
            <p className="text-sm text-zinc-400">Békéscsabai SZC Nemes Tihamér Technikum</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email cím</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
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
                  className="pl-11 h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-lg transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Jelszó</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
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
                  className="pl-11 h-12 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 rounded-lg transition-all"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              {/* Ide jöhet egy emlékezz rám checkbox a jövőben */}
            </div>

            {(error || authError) && (
               <div className="text-red-400 text-sm font-medium">
                {error || authError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/20"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Bejelentkezés'
              )}
            </Button>
          </form>

          <p className="text-xs text-zinc-500 pt-8">
             &copy; {new Date().getFullYear()} Luminé Platform.
          </p>
        </div>
      </div>

      {/* Jobb oldal - Vizuális rész (desktopon) */}
      <div className="hidden lg:flex lg:w-[55%] relative items-center justify-center overflow-hidden bg-[#0A0A0A]">
        {/* Diszkrét, modern geometriai/absztrakt háttér sötét tónusokkal */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-emerald-500 opacity-[0.05] blur-[100px]"></div>
        </div>
        
        <div className="relative z-10 max-w-lg p-12">
          <h2 className="text-3xl font-light text-white leading-relaxed tracking-wide">
            Egyszerű, határozott <br/>
            <span className="font-medium text-emerald-400">interaktív bejelentkezés.</span>
          </h2>
          <p className="mt-6 text-zinc-400 font-light leading-relaxed">
            Lépj be a Luminé oktatási platformba, ahol minden tananyagot és feladatot egy helyen érsz el.
          </p>
        </div>
      </div>
    </div>
  )
}
