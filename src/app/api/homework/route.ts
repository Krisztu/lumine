import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, dueDate, teacherId, teacherName, subject, className, lessonId, attachments } = body

    if (!title || !description || !dueDate || !teacherId || !className) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const homeworkDoc = await db.collection('homework').add({
      title,
      description,
      dueDate,
      teacherId,
      teacherName: teacherName || '',
      subject: subject || '',
      className,
      lessonId: lessonId || '',
      attachments: attachments || [],
      createdAt: new Date().toISOString(),
      status: 'active'
    })

    return NextResponse.json({ success: true, id: homeworkDoc.id })
  } catch (error) {
    console.error('Homework POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni a házi feladatot' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('class')
    const teacherId = searchParams.get('teacherId')
    const studentId = searchParams.get('studentId')

    let homeworkQuery: FirebaseFirestore.Query = db.collection('homework')

    if (className) {
      homeworkQuery = homeworkQuery.where('className', '==', className)
    } else if (teacherId) {
      homeworkQuery = homeworkQuery.where('teacherId', '==', teacherId)
    }

    const homeworkSnapshot = await homeworkQuery.get()
    const homework = homeworkSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    if (studentId) {
      const submissionsQuery = db.collection('homework-submissions').where('studentId', '==', studentId)
      const submissionsSnapshot = await submissionsQuery.get()
      const submissions = submissionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data()
        acc[data.homeworkId] = { id: doc.id, ...data }
        return acc
      }, {} as any)

      return NextResponse.json({ homework, submissions })
    }

    if (teacherId) {
      const allSubmissionsSnapshot = await db.collection('homework-submissions').get()
      const submissionCounts = allSubmissionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data()
        acc[data.homeworkId] = (acc[data.homeworkId] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const homeworkWithCounts = homework.map(hw => ({
        ...hw,
        submissionCount: submissionCounts[hw.id] || 0
      }))

      return NextResponse.json(homeworkWithCounts)
    }

    return NextResponse.json(homework)
  } catch (error) {
    console.error('Homework GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a házi feladatokat' }, { status: 500 })
  }
}