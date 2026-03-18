'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { QrCode, LogIn, LogOut } from 'lucide-react'

interface QRTabProps {
  qrCode: string
  qrType: 'entry' | 'exit'
  generateUserQR: (action?: 'entry' | 'exit') => Promise<void>
}

export function QRTab({ qrCode, qrType, generateUserQR }: QRTabProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="flex items-center text-sm sm:text-lg">
          <QrCode className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          QR Kód
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        {qrCode ? (
          <div className="space-y-4 flex flex-col items-center">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg w-40 sm:w-56 md:w-64">
              <p className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-200 flex items-center justify-center gap-2">
                <QrCode className="h-3 w-3 sm:h-4 sm:w-4" />
                {qrType === 'entry' ? 'Belépési QR kód' : 'Kilépési QR kód'}
              </p>
            </div>
            <div className="flex justify-center w-full">
              <img src={qrCode} alt="QR Code" className="w-40 sm:w-56 md:w-64" />
            </div>
            <div className="flex justify-center gap-2 w-40 sm:w-56 md:w-64">
              <Button
                onClick={() => generateUserQR('entry')}
                variant={qrType === 'entry' ? 'default' : 'outline'}
                className="text-xs sm:text-sm flex items-center justify-center gap-2 flex-1"
              >
                <LogIn className="h-4 w-4" />
                Belépés
              </Button>
              <Button
                onClick={() => generateUserQR('exit')}
                variant={qrType === 'exit' ? 'default' : 'outline'}
                className="text-xs sm:text-sm flex items-center justify-center gap-2 flex-1"
              >
                <LogOut className="h-4 w-4" />
                Kilépés
              </Button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center">
              {qrType === 'entry' 
                ? 'Mutasd fel ezt a QR kódot a portásnál belépéskor'
                : 'Mutasd fel ezt a QR kódot a portásnál kilépéskor'
              }
            </p>
          </div>
        ) : (
          <div className="flex justify-center">
            <Skeleton className="h-40 w-40 sm:h-56 sm:w-56 md:h-64 md:w-64" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}