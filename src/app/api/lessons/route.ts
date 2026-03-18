import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, startTime, subject, teacherName, className, room } = body

    if (!day || !startTime || !subject || !teacherName || !className) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const usersSnapshot = await db.collection('users').get()
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))

    const teacher = allUsers.find((user: any) => (user.fullName || user.name) === teacherName)
    if (!teacher) {
      return NextResponse.json({ error: 'Tanár nem található' }, { status: 400 })
    }

    const classStudents = allUsers.filter((user: any) =>
      (user.role === 'student' || user.role === 'dj') && user.class === className
    )

    const affectedUsers = [teacher, ...classStudents]

    const batch = db.batch()

    affectedUsers.forEach(user => {
      const newLessonRef = db.collection('lessons').doc()
      batch.set(newLessonRef, {
        day,
        startTime,
        subject,
        teacherName,
        className,
        room: room || '',
        userId: user.id || user.email,
        createdAt: new Date().toISOString()
      })
    })

    await batch.commit()

    return NextResponse.json({
      success: true,
      message: `Óra rögzítve ${affectedUsers.length} felhasználónak (1 tanár + ${classStudents.length} diák)`
    })
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült létrehozni az órát' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('class')
    const teacherName = searchParams.get('teacher')
    const userId = searchParams.get('userId')

    let lessonsQuery: FirebaseFirestore.Query = db.collection('lessons')

    if (userId) {
      lessonsQuery = db.collection('lessons').where('userId', '==', userId)
      const lessonsSnapshot = await lessonsQuery.get()
      let lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      if (lessons.length === 0) {
        const userSnapshot = await db.collection('users').where('id', '==', userId).limit(1).get()
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as any
          if (userData?.email) {
            const emailQuery = db.collection('lessons').where('userId', '==', userData.email)
            const emailSnapshot = await emailQuery.get()
            lessons = emailSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          }
        }
      }

      return NextResponse.json(lessons)
    } else if (className) {
      const classLessonsQuery = db.collection('lessons').where('className', '==', className)
      const classLessonsSnapshot = await classLessonsQuery.get()
      
      const uniqueLessons = new Map()
      classLessonsSnapshot.docs.forEach(doc => {
        const lesson = { id: doc.id, ...doc.data() as any }
        const key = `${lesson.day}-${lesson.startTime}`
        if (!uniqueLessons.has(key)) {
          uniqueLessons.set(key, lesson)
        }
      })
      
      return NextResponse.json(Array.from(uniqueLessons.values()))
    } else if (teacherName) {
      lessonsQuery = db.collection('lessons').where('teacherName', '==', teacherName)
    }

    const lessonsSnapshot = await lessonsQuery.get()
    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(lessons)
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült lekérni az órákat' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, startTime, className, subject, teacherName } = body

    if (!day || !startTime || !className) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők (day, startTime, className)' }, { status: 400 })
    }

    let query = db.collection('lessons')
      .where('day', '==', day)
      .where('startTime', '==', startTime)
      .where('className', '==', className)

    if (subject) {
      query = query.where('subject', '==', subject)
    }
    if (teacherName) {
      query = query.where('teacherName', '==', teacherName)
    }

    const lessonsSnapshot = await query.get()
    
    if (lessonsSnapshot.empty) {
      return NextResponse.json({ error: 'Nem található óra a megadott paraméterekkel' }, { status: 404 })
    }

    const batch = db.batch()
    lessonsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })

    await batch.commit()

    return NextResponse.json({ 
      success: true, 
      message: `${lessonsSnapshot.docs.length} óra törölve minden érintett felhasználónál`,
      deletedCount: lessonsSnapshot.docs.length
    })
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült törölni az órákat' }, { status: 500 })
  }
}