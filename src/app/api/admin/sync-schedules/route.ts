import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const usersSnapshot = await db.collection('users').get()
    const students = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() as any }))
      .filter((user: any) => (user.role === 'student' || user.role === 'dj') && user.class)

    let updatedCount = 0

    for (const student of students) {
      const existingLessonsQuery = db.collection('lessons')
        .where('userId', '==', student.id)

      const existingLessonsSnapshot = await existingLessonsQuery.get()

      if (existingLessonsSnapshot.empty) {
        let sourceUserId = null

        const classmatesQuery = db.collection('users')
          .where('class', '==', student.class)

        const classmatesSnapshot = await classmatesQuery.get()

        for (const classmateDoc of classmatesSnapshot.docs) {
          const classmateId = classmateDoc.id

          if (classmateId !== student.id) {
            const classmateScheduleQuery = db.collection('lessons')
              .where('userId', '==', classmateId)

            const classmateScheduleSnapshot = await classmateScheduleQuery.get()

            if (!classmateScheduleSnapshot.empty) {
              sourceUserId = classmateId
              break
            }
          }
        }

        if (sourceUserId) {
          const sourceLessonsQuery = db.collection('lessons')
            .where('userId', '==', sourceUserId)

          const sourceLessonsSnapshot = await sourceLessonsQuery.get()

          if (!sourceLessonsSnapshot.empty) {
            const lessonPromises = sourceLessonsSnapshot.docs.map(lessonDoc => {
              const lessonData = lessonDoc.data()
              return db.collection('lessons').add({
                ...lessonData,
                userId: student.id,
                createdAt: new Date().toISOString()
              })
            })

            await Promise.all(lessonPromises)
            updatedCount++
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Órarend szinkronizálás kész: ${updatedCount} diák frissítve`,
      studentsUpdated: updatedCount,
      totalStudents: students.length
    })
  } catch (error: any) {
    console.error('Sync Schedules POST Error:', error)
    return NextResponse.json({
      error: 'Nem sikerült szinkronizálni az órarendeket'
    }, { status: 500 })
  }
}