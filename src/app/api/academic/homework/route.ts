import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { hasPermission } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, dueDate, teacherId, teacherName, subject, className, lessonId, attachments } = body
    const userRole = request.headers.get('x-user-role')

    if (!title || !description || !dueDate || !teacherId || !className) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    // Jogosultság ellenőrzés
    if (!hasPermission(userRole, 'canCreateHomework')) {
      return NextResponse.json({ error: 'Nincs jogosultság házi feladat létrehozásához' }, { status: 403 })
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
    const userRole = request.headers.get('x-user-role')

    // Jogosultság ellenőrzés
    if (!hasPermission(userRole, 'canViewHomework')) {
      return NextResponse.json({ error: 'Nincs jogosultság házi feladatok megtekintéséhez' }, { status: 403 })
    }

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
      const homeworkIds = homework.map(hw => hw.id)
      let submissionsSnapshot
      
      if (homeworkIds.length > 0) {
        const submissionsQuery = db.collection('homework-submissions')
          .where('homeworkId', 'in', homeworkIds)
        submissionsSnapshot = await submissionsQuery.get()
      } else {
        submissionsSnapshot = { docs: [] }
      }
      
      const submissionsByHomework = submissionsSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data()
        if (!acc[data.homeworkId]) acc[data.homeworkId] = []
        acc[data.homeworkId].push({ id: doc.id, ...data })
        return acc
      }, {} as Record<string, any[]>)

      const homeworkWithSubmissions = homework.map(hw => ({
        ...hw,
        submissions: submissionsByHomework[hw.id] || [],
        submissionCount: (submissionsByHomework[hw.id] || []).length
      }))

      return NextResponse.json(homeworkWithSubmissions)
    }

    return NextResponse.json(homework)
  } catch (error) {
    console.error('Homework GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a házi feladatokat' }, { status: 500 })
  }
}