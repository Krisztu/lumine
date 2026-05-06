'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

interface ExcusesTabProps {
  attendance: any[]
  expandedDates: { [key: string]: boolean }
  setExpandedDates: (dates: { [key: string]: boolean }) => void
}

export function ExcusesTab({
  attendance,
  expandedDates,
  setExpandedDates
}: ExcusesTabProps) {
  if (attendance.length === 0) {
    return (
      <Card className="border-none shadow-sm">
        <CardContent className="text-center py-8 text-gray-500">
          <p>Nincsenek mulasztások.</p>
        </CardContent>
      </Card>
    )
  }

  const groupedByDate = attendance.reduce((acc, record) => {
    const date = new Date(record.date).toLocaleDateString('hu-HU')
    if (!acc[date]) acc[date] = []
    acc[date].push(record)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Mulasztások</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-3">
          {(Object.entries(groupedByDate) as [string, any[]][]).map(([date, records]) => (
            <div key={date} className="border border-white/10 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedDates({ ...expandedDates, [date]: !expandedDates[date] })}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <span className="font-medium">{date}</span>
                <span className="text-sm text-gray-500">{records.length} mulasztás</span>
              </button>
              {expandedDates[date] && (
                <div className="border-t border-white/10 p-4 space-y-2 bg-white/5">
                  {records.map((record, idx) => (
                    <div key={idx} className={`text-sm p-3 rounded-lg border-l-4 ${
                      record.excused 
                        ? 'bg-green-50 dark:bg-green-900/20 border-l-green-500 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900/20 border-l-red-500 text-red-800 dark:text-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{record.subject}</div>
                          <div className="text-xs opacity-75">{record.startTime}</div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          record.excused 
                            ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                        }`}>
                          {record.excused ? 'Igazolt' : 'Igazolatlan'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
