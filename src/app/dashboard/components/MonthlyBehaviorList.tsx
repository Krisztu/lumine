'use client'

import { Card, CardContent } from '@/shared/components/ui/card'

interface MonthlyBehavior {
  id: string
  studentId: string
  studentName: string
  studentClass: string
  month: string
  diligence: string
  behavior: string
  createdAt: string
}

interface MonthlyBehaviorListProps {
  records: MonthlyBehavior[]
  showStudent?: boolean
}

export function MonthlyBehaviorList({ records, showStudent = true }: MonthlyBehaviorListProps) {
  if (records.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="text-center py-8 text-gray-500">
          <p>Nincsenek havi szorgalom és magatartás bejegyzések.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {records.map(record => (
        <Card key={record.id} className="border-none shadow-sm">
          <CardContent className="p-4">
            {showStudent && (
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                {record.studentName} ({record.studentClass})
              </h4>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {new Date(record.month + '-01').toLocaleDateString('hu-HU', { year: 'numeric', month: 'long' })}
            </p>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Szorgalom:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{record.diligence}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Magatartás:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{record.behavior}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
