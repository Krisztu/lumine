'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Badge } from '@/shared/components/ui/badge'
import { UserIcon, BookOpen } from 'lucide-react'

interface AdminDashboardProps {
  allUsers: any[]
  teacherSearch: string
  setTeacherSearch: (value: string) => void
  studentSearch: string
  setStudentSearch: (value: string) => void
}

export function AdminDashboard({
  allUsers,
  teacherSearch,
  setTeacherSearch,
  studentSearch,
  setStudentSearch
}: AdminDashboardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <UserIcon className="h-5 w-5 mr-2 text-blue-600" />
            Tanárok
          </CardTitle>
          <Input
            placeholder="Keresés név vagy email alapján..."
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allUsers
              .filter(user => user.role === 'teacher' || user.role === 'homeroom_teacher')
              .filter(user =>
                !teacherSearch ||
                (user.fullName || user.name || '').toLowerCase().includes(teacherSearch.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(teacherSearch.toLowerCase())
              )
              .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
              .slice(0, 5)
              .map((teacher, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition-shadow">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{teacher.fullName || teacher.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{teacher.email}</p>
                  {teacher.subject && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Tantárgy: {teacher.subject}</p>}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <BookOpen className="h-5 w-5 mr-2 text-green-600" />
            Diákok
          </CardTitle>
          <Input
            placeholder="Keresés név vagy email alapján..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="mt-2"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allUsers
              .filter(user => user.role === 'student' || user.role === 'dj')
              .filter(user =>
                !studentSearch ||
                (user.fullName || user.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
                (user.email || '').toLowerCase().includes(studentSearch.toLowerCase())
              )
              .sort((a, b) => (a.fullName || a.name || '').localeCompare(b.fullName || b.name || ''))
              .slice(0, 5)
              .map((student, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{student.fullName || student.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{student.email}</p>
                      {student.class && <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Osztály: {student.class}</p>}
                    </div>
                    {student.role === 'dj' && <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">DJ</Badge>}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
