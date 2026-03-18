'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/components/ui/table'
import { ResponsiveTable, MobileTable } from '@/shared/components/ui/mobile-table'
import { Calendar, BookOpen } from 'lucide-react'

interface StudentDashboardProps {
  lessons: any[]
  grades: any[]
  currentTime: Date
  selectedDate: Date
  userRole: string
  user: any
  homework: any[]
}

const fillEmptyPeriods = (dayLessons: any[]) => {
  if (dayLessons.length === 0) return []

  const timeSlots = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45']
  const filledLessons = []
  
  // Órák rendezése időrend szerint
  const sortedLessons = dayLessons.sort((a, b) => {
    const timeA = timeSlots.indexOf(a.StartTime)
    const timeB = timeSlots.indexOf(b.StartTime)
    return timeA - timeB
  })
  
  const existingTimes = sortedLessons.map(lesson => lesson.StartTime)
  const lastLessonIndex = Math.max(...existingTimes.map(time => timeSlots.indexOf(time)))

  for (let i = 0; i <= lastLessonIndex; i++) {
    const time = timeSlots[i]
    const existingLesson = sortedLessons.find(lesson => lesson.StartTime === time)

    if (existingLesson) {
      filledLessons.push(existingLesson)
    } else {
      filledLessons.push({
        StartTime: time,
        Subject: 'Lyukas óra',
        Teacher: '',
        Class: '',
        Room: '',
        status: 'free'
      })
    }
  }

  return filledLessons
}

export function StudentDashboard({
  lessons,
  grades,
  currentTime,
  selectedDate,
  userRole,
  user,
  homework
}: StudentDashboardProps) {
  const today = new Date().toLocaleDateString('hu-HU', { weekday: 'long' })
  const dayMap: { [key: string]: string } = { 'hétfő': 'Hétfő', 'kedd': 'Kedd', 'szerda': 'Szerda', 'csütörtök': 'Csütörtök', 'péntek': 'Péntek' }
  const todayKey = today.toLowerCase()
  const mappedDay = dayMap[todayKey] || today
  const dayLessons = lessons.filter(lesson => lesson.Day === mappedDay)
  
  // Órák rendezése időrend szerint
  const timeSlots = ['7:45', '8:45', '9:45', '10:45', '11:45', '12:45', '13:45', '14:45']
  const sortedDayLessons = dayLessons.sort((a, b) => {
    const timeA = timeSlots.indexOf(a.StartTime)
    const timeB = timeSlots.indexOf(b.StartTime)
    return timeA - timeB
  })
  
  const filledLessons = fillEmptyPeriods(sortedDayLessons)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-lg">
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
            <span className="text-xs sm:text-base">Mai órák - {new Date().toLocaleDateString('hu-HU', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <ResponsiveTable
            breakpoint="md"
            mobileComponent={
              <MobileTable
                data={filledLessons}
                columns={[
                  { key: 'StartTime', label: 'Idő' },
                  { 
                    key: 'Subject', 
                    label: 'Tantárgy',
                    render: (value, lesson) => (
                      <span className={
                        lesson.status === 'cancelled' ? 'text-red-500' :
                          lesson.status === 'substituted' ? 'text-yellow-600' :
                            lesson.status === 'added' ? 'text-green-600' :
                              lesson.status === 'free' ? 'text-gray-400 italic' : ''
                      }>
                        {value || 'N/A'}
                        {lesson.status === 'cancelled' && ' (Elmaradt)'}
                        {lesson.status === 'substituted' && ' (Helyettesítés)'}
                        {lesson.status === 'added' && ' (Új óra)'}
                      </span>
                    )
                  },
                  { 
                    key: userRole === 'teacher' ? 'Class' : 'Teacher', 
                    label: userRole === 'teacher' ? 'Osztály' : 'Tanár',
                    render: (value, lesson) => (
                      <span className={lesson.status === 'free' ? 'text-gray-400' : ''}>
                        {lesson.status === 'free' ? '-' : (value || 'N/A')}
                      </span>
                    )
                  }
                ]}
                emptyMessage="Nincsenek órák ma"
              />
            }
          >
            <Table className="text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Idő</TableHead>
                  <TableHead>Tantárgy</TableHead>
                  <TableHead>{userRole === 'teacher' ? 'Osztály' : 'Tanár'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filledLessons.map((lesson, index) => (
                  <TableRow key={index}>
                    <TableCell>{lesson.StartTime || 'N/A'}</TableCell>
                    <TableCell className={
                      lesson.status === 'cancelled' ? 'text-red-500' :
                        lesson.status === 'substituted' ? 'text-yellow-600' :
                          lesson.status === 'added' ? 'text-green-600' :
                            lesson.status === 'free' ? 'text-gray-400 italic' : ''
                    }>
                      {lesson.Subject || 'N/A'}
                      {lesson.status === 'cancelled' && ' (Elmaradt)'}
                      {lesson.status === 'substituted' && ' (Helyettesítés)'}
                      {lesson.status === 'added' && ' (Új óra)'}
                    </TableCell>
                    <TableCell className={lesson.status === 'free' ? 'text-gray-400' : ''}>
                      {lesson.status === 'free' ? '-' : (userRole === 'teacher' ? (lesson.Class || 'N/A') : (lesson.Teacher || 'N/A'))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center text-sm sm:text-lg">
            <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
            <span className="text-xs sm:text-base">{userRole === 'teacher' ? 'Általam adott jegyek' : 'Legutóbbi jegyek'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <ResponsiveTable
            breakpoint="md"
            mobileComponent={
              <MobileTable
                data={grades.slice(0, 5)}
                columns={[
                  { key: 'subject', label: 'Tárgy' },
                  ...(userRole === 'teacher' ? [
                    { key: 'studentName', label: 'Diák' },
                    { key: 'studentClass', label: 'Osztály' }
                  ] : []),
                  { 
                    key: 'grade', 
                    label: 'Jegy',
                    render: (value) => (
                      <span className={`px-2 py-1 rounded text-white text-xs ${(value || 0) >= 4 ? 'bg-green-500' :
                        (value || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                        {value || 'N/A'}
                      </span>
                    )
                  },
                  { 
                    key: 'date', 
                    label: 'Dátum',
                    render: (value) => new Date(value).toLocaleDateString('hu-HU')
                  }
                ]}
                emptyMessage="Nincsenek jegyek"
              />
            }
          >
            <Table className="text-xs sm:text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>Tantárgy</TableHead>
                  {userRole === 'teacher' && <TableHead>Diák</TableHead>}
                  {userRole === 'teacher' && <TableHead>Osztály</TableHead>}
                  <TableHead>Jegy</TableHead>
                  <TableHead>Dátum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {grades.slice(0, 5).map((grade, index) => (
                  <TableRow key={index}>
                    <TableCell>{grade.subject || 'N/A'}</TableCell>
                    {userRole === 'teacher' && <TableCell>{grade.studentName || 'N/A'}</TableCell>}
                    {userRole === 'teacher' && <TableCell>{grade.studentClass || 'N/A'}</TableCell>}
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-white ${(grade.grade || 0) >= 4 ? 'bg-green-500' :
                        (grade.grade || 0) >= 3 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                        {grade.grade || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(grade.date).toLocaleDateString('hu-HU')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResponsiveTable>
        </CardContent>
      </Card>
    </div>
  )
}
