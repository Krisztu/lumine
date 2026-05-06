'use client'

import { Loader2 } from 'lucide-react'

interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({ message = "Betöltés..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505] text-white">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
        <p className="text-zinc-400 text-sm font-medium tracking-wide">{message}</p>
      </div>
    </div>
  )
}