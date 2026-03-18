import { NextRequest, NextResponse } from 'next/server'
import { db, auth } from '@/lib/firebase-admin'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role') as any
    
    if (!hasPermission(role, 'canViewStatistics')) {
      return NextResponse.json({ error: 'Nincs engedélye statisztikákat megtekinteni' }, { status: 403 })
    }

    console.log('Statistics API called')
    const today = new Date().toISOString().split('T')[0]
    
    // Felhasználók
    const usersSnapshot = await db.collection('users').get()
    const users = usersSnapshot.docs.map(d => d.data())

    const userStats = {
      total: users.length,
      students: users.filter(u => u.role === 'student').length,
      teachers: users.filter(u => u.role === 'teacher' || u.role === 'homeroom_teacher').length,
      parents: users.filter(u => u.role === 'parent').length,
      admins: users.filter(u => u.role === 'admin').length,
      djs: users.filter(u => u.role === 'dj').length
    }

    // Jegyek
    const gradesSnapshot = await db.collection('grades').get()
    const grades = gradesSnapshot.docs.map(d => d.data())

    const gradeStats = {
      total: grades.length,
      average: grades.length > 0
        ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
        : 0,
      byGrade: {
        1: grades.filter(g => g.grade === 1).length,
        2: grades.filter(g => g.grade === 2).length,
        3: grades.filter(g => g.grade === 3).length,
        4: grades.filter(g => g.grade === 4).length,
        5: grades.filter(g => g.grade === 5).length
      }
    }

    // Mulasztások
    const attendanceSnapshot = await db.collection('attendance').get()
    const attendance = attendanceSnapshot.docs.map(d => d.data())

    const totalRecords = attendance.reduce((sum, a) => sum + (a.students?.length || 0), 0)
    const presentCount = attendance.reduce((sum, a) => 
      sum + (a.students?.filter((s: any) => s.present).length || 0), 0
    )
    const absentCount = totalRecords - presentCount

    const attendanceStats = {
      total: totalRecords,
      present: presentCount,
      absent: absentCount,
      excused: attendance.reduce((sum, a) =>
        sum + (a.students?.filter((s: any) => s.excused).length || 0), 0
      ),
      percentage: totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0
    }

    // Házi feladatok
    const homeworkSnapshot = await db.collection('homework').get()
    const homework = homeworkSnapshot.docs.map(d => d.data())

    const submissionsSnapshot = await db.collection('homework_submissions').get()
    const submissions = submissionsSnapshot.docs.map(d => d.data())

    const homeworkStats = {
      total: homework.length,
      submitted: submissions.length,
      pending: homework.filter(h => !submissions.find(s => s.homeworkId === h.id)).length,
      overdue: homework.filter(h => new Date(h.dueDate) < new Date()).length
    }

    // Viselkedés
    const behaviorSnapshot = await db.collection('behavior_records').get()
    const behavior = behaviorSnapshot.docs.map(d => d.data())

    const behaviorStats = {
      positive: behavior.filter(b => b.type === 'positive').length,
      negative: behavior.filter(b => b.type === 'negative').length,
      average: behavior.length > 0
        ? behavior.reduce((sum, b) => sum + (b.points || 0), 0) / behavior.length
        : 0
    }

    // Top osztályok
    const classes = [...new Set(users.map(u => u.class).filter(Boolean))]
    const topClasses = await Promise.all(
      classes.map(async (className) => {
        const classGrades = grades.filter(g => g.studentClass === className)
        const average = classGrades.length > 0
          ? classGrades.reduce((sum, g) => sum + (g.grade || 0), 0) / classGrades.length
          : 0
        return {
          name: className,
          averageGrade: average,
          studentCount: users.filter(u => u.class === className && u.role === 'student').length
        }
      })
    )

    // 30 napos trend
    const trend = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      trend.push({
        date: dateStr,
        users: userStats,
        grades: gradeStats,
        attendance: attendanceStats,
        behavior: behaviorStats
      })
    }

    return NextResponse.json({
      today: {
        date: today,
        users: userStats,
        grades: gradeStats,
        attendance: attendanceStats,
        homework: homeworkStats,
        behavior: behaviorStats
      },
      thisMonth: trend,
      topClasses: topClasses.sort((a, b) => b.averageGrade - a.averageGrade)
    })
  } catch (error) {
    console.error('Statisztikák hiba:', error)
    return NextResponse.json({ error: 'Hiba: ' + String(error) }, { status: 500 })
  }
}
