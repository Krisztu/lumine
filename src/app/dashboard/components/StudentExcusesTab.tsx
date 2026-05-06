'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'

interface StudentExcusesTabProps {
  attendance: any[]
  excuses: any[]
  selectedAbsences: any[]
  setSelectedAbsences: (absences: any[]) => void
  excuseForm: any
  setExcuseForm: (form: any) => void
  currentUser: any
  user: any
  loadExcuses: () => Promise<void>
  showAlert: (msg: string, type: 'success' | 'error' | 'warning' | 'info', title?: string) => void
  isTeacher?: boolean
}

export function StudentExcusesTab({
  attendance,
  excuses,
}: StudentExcusesTabProps) {
  return (
    <Card className="border-none shadow-sm">
      <CardHeader className="p-3 sm:p-6">
        <CardTitle className="text-sm sm:text-lg">Mulasztásaim</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden relative group">
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Mulasztási Állapot</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {attendance.filter(a => a.excused).length}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">/ 250 igazolt óra</span>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    attendance.filter(a => a.excused).length > 200 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {Math.round((attendance.filter(a => a.excused).length / 250) * 100)}% Felhasználva
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner flex">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((attendance.filter(a => a.excused).length / 250) * 100, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 px-1">
                  <span>Tanév kezdete</span>
                  <span>Kritikus limit (250 óra)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Igazolatlan</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-lg font-bold text-red-500">
                      {attendance.filter(a => !a.excused).length} óra
                    </span>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Összes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-lg font-bold text-blue-500">
                      {attendance.length} óra
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-6">
            <h4 className="font-semibold mb-3">Beküldött igazolások</h4>
            {excuses.length === 0 ? (
              <p className="text-sm text-gray-500">Még nem küldtek be igazolást.</p>
            ) : (
              <div className="space-y-2">
                {excuses.map(excuse => (
                  <div key={excuse.id} className={`p-3 rounded-lg border ${
                    excuse.status === 'approved' ? 'bg-green-500/10 border-green-500/30' :
                    excuse.status === 'rejected' ? 'bg-red-500/10 border-red-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{excuse.excuseType}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {excuse.absenceIds?.length || 0} hiányzás - {new Date(excuse.submittedAt).toLocaleDateString('hu-HU')}
                        </div>
                      </div>
                      <Badge className={excuse.status === 'approved' ? 'bg-green-500' : excuse.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'}>
                        {excuse.status === 'approved' ? 'Elfogadva' : excuse.status === 'rejected' ? 'Elutasítva' : 'Függőben'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
