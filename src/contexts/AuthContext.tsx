'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, UserCredential, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<UserCredential>
  logout: () => Promise<void>
  error: string | null
  role: string | null
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [initialized, setInitialized] = useState<boolean>(false)

  useEffect(() => {
    let isMounted = true
    
    // Gyorsabb inicializálás timeout-tal
    const initTimeout = setTimeout(() => {
      if (isMounted && !initialized) {
        setLoading(false)
        setInitialized(true)
      }
    }, 3000) // 3 másodperc várakozás

    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return
        
        clearTimeout(initTimeout)
        
        if (user) {
          try {
            // Egyszerűbb role lekérés
            const response = await fetch(`/api/users?email=${encodeURIComponent(user.email || '')}&cache=false`)
            if (response.ok) {
              const users = await response.json()
              if (users.length > 0) {
                setRole(users[0].role || null)
              }
            }
          } catch (error) {
            console.error('AuthContext: Error fetching user role:', error)
            setRole(null)
          }
        } else {
          setRole(null)
        }
        
        if (isMounted) {
          setUser(user)
          setLoading(false)
          setInitialized(true)
        }
      }, (error) => {
        if (!isMounted) return
        
        clearTimeout(initTimeout)
        console.error('AuthContext: Auth error:', error)
        setError(error.message)
        setLoading(false)
        setInitialized(true)
      })
      
      return () => {
        isMounted = false
        clearTimeout(initTimeout)
        unsubscribe()
      }
    } catch (error) {
      console.error('AuthContext: Error setting up auth listener:', error)
      setLoading(false)
      setInitialized(true)
      setError('Firebase inicializálási hiba')
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await signInWithEmailAndPassword(auth, email, password)
      await result.user.getIdToken(true)
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error.code)
      setError(friendlyMessage)
      throw new Error(friendlyMessage)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      return result
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error.code)
      setError(friendlyMessage)
      throw new Error(friendlyMessage)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (error: any) {
      setError(error.message)
      throw error
    }
  }
  
  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, logout, error, role }}>
      {children}
    </AuthContext.Provider>
  )
}

// Felhasználóbarát hibaüzenetek Firebase hibakódokhoz
const getFriendlyErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'Nincs ilyen fiók regisztrálva'
    case 'auth/wrong-password':
      return 'Helytelen jelszó'
    case 'auth/invalid-email':
      return 'Érvénytelen email cím'
    case 'auth/user-disabled':
      return 'Ez a fiók le van tiltva'
    case 'auth/too-many-requests':
      return 'Túl sok sikertelen próbálkozás. Próbálja újra később'
    case 'auth/network-request-failed':
      return 'Hálózati hiba. Ellenőrizze az internetkapcsolatot'
    case 'auth/weak-password':
      return 'A jelszó túl gyenge. Legalább 6 karakter szükséges'
    case 'auth/email-already-in-use':
      return 'Ez az email cím már használatban van'
    case 'auth/invalid-credential':
      return 'Helytelen bejelentkezési adatok'
    case 'auth/missing-password':
      return 'Jelszó megadása kötelező'
    case 'auth/missing-email':
      return 'Email cím megadása kötelező'
    default:
      return 'Bejelentkezési hiba történt. Próbálja újra'
  }
}

export const useAuth = () => useContext(AuthContext)