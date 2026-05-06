import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { Query } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { homeworkId, studentId, studentName, content, attachments } = body

    if (!homeworkId || !studentId || !studentName) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const sanitizedData = {
      homeworkId,
      studentId: studentId.trim(),
      studentName: studentName.trim().substring(0, 100),
      content: (content || '').trim().substring(0, 2000),
      attachments: Array.isArray(attachments) ? attachments.slice(0, 5) : [],
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      grade: null,
      feedback: '',
      evaluated: false
    }

    const submissionDoc = await db.collection('homework-submissions').add(sanitizedData)

    return NextResponse.json({ success: true, id: submissionDoc.id })
  } catch (error) {
    console.error('Homework Submissions POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült beadni a házi feladatot' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const homeworkId = searchParams.get('homeworkId')
    const studentId = searchParams.get('studentId')

    let submissionsQuery: Query = db.collection('homework-submissions')

    if (homeworkId) {
      submissionsQuery = submissionsQuery.where('homeworkId', '==', homeworkId)
    } else if (studentId) {
      submissionsQuery = submissionsQuery.where('studentId', '==', studentId)
    }

    const submissionsSnapshot = await submissionsQuery.get()
    const submissions = submissionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(submissions)
  } catch (error) {
    console.error('Homework Submissions GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a beadásokat' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { submissionId, status } = body

    if (!submissionId) {
      return NextResponse.json({ error: 'Beadás azonosító szükséges' }, { status: 400 })
    }

    const updateData: any = {
      status: status || 'evaluated',
      evaluatedAt: new Date().toISOString()
    }

    await db.collection('homework-submissions').doc(submissionId).update(updateData)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Homework Submissions PUT Error:', error)
    return NextResponse.json({ error: 'Nem sikerült értékelni a beadást' }, { status: 500 })
  }
}