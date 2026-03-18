'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { CheckCircle, XCircle, Clock } from 'lucide-react'

export default function QRScanPage() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'early'>('loading')
  const [message, setMessage] = useState<string>('')
  const [studentName, setStudentName] = useState<string>('')

  useEffect(() => {
    const studentId = searchParams.get('student')
    const action = searchParams.get('action')

    if (!studentId || !action) {
      setStatus('error')
      setMessage('Hibás QR kód')
      return
    }

    handleQRScan(studentId, action)
  }, [searchParams])

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        window.close()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const handleQRScan = async (studentId: string, action: string) => {
    try {
      const response = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, action })
      })

      const result = await response.json()

      if (result.success) {
        setStudentName(result.studentName)
        
        if (result.action === 'entry') {
          setStatus('success')
          setMessage(`Sikeres belépés! Jó napot, ${result.studentName}!`)
        } else if (result.action === 'exit') {
          if (result.canExit) {
            setStatus('success')
            setMessage(`Sikeres kilépés! Viszlát holnap, ${result.studentName}!`)
          } else {
            setStatus('early')
            setMessage(`${result.studentName}, még van órád! Menj vissza órára.`)
          }
        }
      } else {
        setStatus('error')
        setMessage(result.error || 'Hiba történt')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Kapcsolódási hiba')
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'error': return 'bg-red-500'
      case 'early': return 'bg-red-500'
      default: return 'bg-blue-500'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return <CheckCircle className="w-16 h-16 text-white" />
      case 'error': return <XCircle className="w-16 h-16 text-white" />
      case 'early': return <XCircle className="w-16 h-16 text-white" />
      default: return <Clock className="w-16 h-16 text-white animate-spin" />
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${getStatusColor()}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          <CardTitle className="text-2xl">
            {status === 'loading' ? 'Feldolgozás...' : 
             status === 'success' ? 'Sikeres!' :
             status === 'early' ? 'Korai kilépés!' : 'Hiba!'}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg">{message}</p>
          {status === 'success' && (
            <p className="text-sm text-gray-600 mt-4">
              Ez az oldal 5 másodperc múlva bezárul.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}