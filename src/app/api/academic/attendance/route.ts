import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { Query } from 'firebase-admin/firestore'
import { hasPermission } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { lessonId, teacherId, date, startTime, subject, className, topic, students } = body
    const userRole = request.headers.get('x-user-role')

    if (!lessonId || !teacherId || !date || !students) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    // Jogosultság ellenőrzés
    if (!hasPermission(userRole, 'canManageAttendance')) {
      return NextResponse.json({ error: 'Nincs jogosultság jelenlét rögzítéséhez' }, { status: 403 })
    }

    const absencePromises = students
      .filter((student: any) => !student.present)
      .map((student: any) =>
        db.collection('absences').add({
          studentId: student.studentId,
          studentName: student.studentName,
          lessonId,
          teacherId,
          date,
          startTime,
          subject,
          className,
          topic: topic || '',
          excused: student.excused || false,
          createdAt: new Date().toISOString()
        })
      )

    await Promise.all(absencePromises)

    const attendanceDoc = await db.collection('attendance').add({
      lessonId,
      teacherId,
      date,
      startTime,
      subject,
      className,
      topic: topic || '',
      students,
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, id: attendanceDoc.id })
  } catch (error) {
    console.error('Attendance POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült rögzíteni a jelenlétet' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')
    const className = searchParams.get('class')
    const date = searchParams.get('date')

    if (studentId) {
      const absencesQuery = db.collection('absences').where('studentId', '==', studentId)
      const absencesSnapshot = await absencesQuery.get()
      const absences = absencesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        present: false
      }))
      return NextResponse.json(absences)
    }

    let attendanceQuery: Query = db.collection('attendance')

    if (teacherId) {
      attendanceQuery = attendanceQuery.where('teacherId', '==', teacherId)
    } else if (className) {
      attendanceQuery = attendanceQuery.where('className', '==', className)
    }

    const attendanceSnapshot = await attendanceQuery.get()
    const attendance = attendanceSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Attendance GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a jelenlétet' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, topic, students, studentId, excused, excusedBy } = body

    if (!id) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const attendanceRef = db.collection('attendance').doc(id)

    if (topic !== undefined && students) {
      await attendanceRef.update({
        topic,
        students,
        updatedAt: new Date().toISOString()
      })

      const attendanceDoc = await attendanceRef.get()
      const originalData = attendanceDoc.data()

      const absencesQuery = db.collection('absences')
        .where('lessonId', '==', originalData?.lessonId)
        .where('date', '==', originalData?.date)
        .where('startTime', '==', originalData?.startTime)

      const absencesSnapshot = await absencesQuery.get()

      const deletePromises = absencesSnapshot.docs.map(doc => doc.ref.delete())
      await Promise.all(deletePromises)

      const addPromises = students
        .filter((student: any) => !student.present)
        .map((student: any) =>
          db.collection('absences').add({
            studentId: student.studentId,
            studentName: student.studentName,
            lessonId: originalData?.lessonId,
            teacherId: originalData?.teacherId,
            date: originalData?.date,
            startTime: originalData?.startTime,
            subject: originalData?.subject,
            className: originalData?.className,
            topic: topic || originalData?.topic || '',
            excused: student.excused || false,
            createdAt: new Date().toISOString()
          })
        )

      await Promise.all(addPromises)
    } else if (studentId) {
      const attendanceDoc = await attendanceRef.get()

      if (!attendanceDoc.exists) {
        return NextResponse.json({ error: 'Jelenléti adat nem található' }, { status: 404 })
      }

      const attendanceData = attendanceDoc.data()
      const updatedStudents = attendanceData?.students.map((student: any) => {
        if (student.studentId === studentId) {
          return {
            ...student,
            excused: excused || false,
            excusedBy: excusedBy || '',
            excusedAt: excused ? new Date().toISOString() : null
          }
        }
        return student
      })

      await attendanceRef.update({ students: updatedStudents })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Attendance PUT Error:', error)
    return NextResponse.json({ error: 'Nem sikerült frissíteni a jelenlétet' }, { status: 500 })
  }
}