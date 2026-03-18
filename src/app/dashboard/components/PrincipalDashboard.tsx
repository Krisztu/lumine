'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { UserIcon, BookOpen, BarChart3 } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'

interface PrincipalDashboardProps {
  showAlert: (message: string, type?: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  allUsers: any[]
}

export function PrincipalDashboard({ showAlert, allUsers }: PrincipalDashboardProps) {
  const [statistics, setStatistics] = useState<any>({})
  const [userSearch, setUserSearch] = useState('')

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/admin/statistics')
      if (response.ok) {
        const data = await response.json()
        setStatistics(data)
      }
    } catch (error) {
      console.error('Statisztikák betöltése sikertelen:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Iskola statisztikák
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100">Diákok</h4>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {allUsers.filter(u => u.role === 'student' || u.role === 'dj').length}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-semibold text-green-900 dark:text-green-100">Tanárok</h4>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {allUsers.filter(u => u.role === 'teacher' || u.role === 'homeroom_teacher').length}
              </p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Szülők</h4>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {allUsers.filter(u => u.role === 'parent').length}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <h4 className="font-semibold text-purple-900 dark:text-purple-100">Összes</h4>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {allUsers.length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
