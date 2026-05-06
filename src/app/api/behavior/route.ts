import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { Query } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, studentName, studentClass, type, level, description, reason, recordedBy, recordedByName } = body

    if (!studentId || !type || !level || !description) {
      return NextResponse.json({ error: 'Hiányzó mezők' }, { status: 400 })
    }

    const behaviorRecord = {
      studentId,
      studentName: studentName || '',
      studentClass: studentClass || '',
      type,
      level,
      description,
      reason: reason || '',
      recordedBy: recordedBy || '',
      recordedByName: recordedByName || '',
      createdAt: new Date().toISOString(),
      parentNotified: false
    }

    const docRef = await db.collection('behavior_records').add(behaviorRecord)

    return NextResponse.json({ id: docRef.id, ...behaviorRecord }, { status: 201 })
  } catch (error) {
    console.error('Behavior API error:', error)
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const className = searchParams.get('className')

    let behaviorQuery: Query = db.collection('behavior_records')

    if (studentId) {
      behaviorQuery = behaviorQuery.where('studentId', '==', studentId)
    } else if (className) {
      behaviorQuery = behaviorQuery.where('studentClass', '==', className)
    } else {
      return NextResponse.json({ error: 'Hiányzó paraméterek' }, { status: 400 })
    }

    const snapshot = await behaviorQuery.get()
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    return NextResponse.json(records)
  } catch (error) {
    console.error('Behavior GET error:', error)
    return NextResponse.json({ error: 'Szerver hiba' }, { status: 500 })
  }
}