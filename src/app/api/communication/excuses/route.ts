import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const classTeacher = searchParams.get('classTeacher')

    let excuseQuery = db.collection('excuses')

    if (studentId) {
      excuseQuery = excuseQuery.where('studentId', '==', studentId)
    } else if (classTeacher) {
      excuseQuery = excuseQuery.where('studentClass', '==', classTeacher)
    }

    const snapshot = await excuseQuery.get()
    const excuses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    }))

    excuses.sort((a: any, b: any) => {
      const dateA = new Date(a.submittedAt || a.createdAt || 0).getTime()
      const dateB = new Date(b.submittedAt || b.createdAt || 0).getTime()
      return dateB - dateA
    })

    return NextResponse.json(excuses)
  } catch (error) {
    console.error('Excuses GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni az igazolásokat' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, studentName, studentClass, absenceIds, excuseType, description, submittedBy } = body

    if (!studentId || !absenceIds || !excuseType) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const excuseDoc = await db.collection('excuses').add({
      studentId,
      studentName: studentName || '',
      studentClass: studentClass || '',
      absenceIds,
      excuseType,
      description: description || '',
      submittedBy: submittedBy || '',
      status: 'pending',
      submittedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true, id: excuseDoc.id })
  } catch (error) {
    console.error('Excuses POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült beküldeni az igazolást' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, reviewedBy } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const excuseRef = db.collection('excuses').doc(id)
    await excuseRef.update({
      status,
      reviewedBy: reviewedBy || '',
      reviewedAt: new Date().toISOString()
    })

    if (status === 'approved') {
      const excuseDoc = await excuseRef.get()
      const excuseData = excuseDoc.data()

      if (excuseData?.absenceIds) {
        for (const absenceId of excuseData.absenceIds) {
          const absenceRef = db.collection('absences').doc(absenceId)
          await absenceRef.update({
            excused: true,
            excusedBy: reviewedBy,
            excusedAt: new Date().toISOString()
          })
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Excuses PUT Error:', error)
    return NextResponse.json({ error: 'Nem sikerült elbírálni az igazolást' }, { status: 500 })
  }
}