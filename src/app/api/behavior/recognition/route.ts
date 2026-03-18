import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    const type = searchParams.get('type') // 'praise' | 'warning'

    let recognitionQuery = db.collection('behaviorRecognition')

    if (studentId) {
      recognitionQuery = recognitionQuery.where('studentId', '==', studentId)
    }
    if (teacherId) {
      recognitionQuery = recognitionQuery.where('teacherId', '==', teacherId)
    }
    if (type) {
      recognitionQuery = recognitionQuery.where('type', '==', type)
    }

    const snapshot = await recognitionQuery.get()
    const recognitions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(recognitions)
  } catch (error) {
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { studentId, studentName, teacherId, teacherName, type, reason, description } = data

    const recognitionData = {
      studentId,
      studentName,
      teacherId,
      teacherName,
      type,
      reason,
      description: description || '',
      createdAt: new Date(),
      acknowledged: false
    }

    const docRef = await db.collection('behaviorRecognition').add(recognitionData)
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...recognitionData,
      message: type === 'praise' ? 'Dicséret rögzítve' : 'Figyelmeztetés rögzítve'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, acknowledged } = data

    await db.collection('behaviorRecognition').doc(id).update({
      acknowledged: acknowledged || false,
      acknowledgedAt: new Date()
    })

    return NextResponse.json({ message: 'Státusz frissítve' })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}