import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const month = searchParams.get('month')

    if (!studentId) {
      return NextResponse.json({ error: 'studentId szükséges' }, { status: 400 })
    }

    let query = db.collection('monthlyBehavior').where('studentId', '==', studentId)
    
    if (month) {
      query = query.where('month', '==', month)
    }

    const snapshot = await query.orderBy('month', 'desc').get()
    const records = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(records)
  } catch (error) {
    console.error('Hiba a havi szorgalom betöltésekor:', error)
    return NextResponse.json({ error: 'Betöltési hiba' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, studentName, studentClass, month, diligence, behavior } = body

    if (!studentId || !month || !diligence || !behavior) {
      return NextResponse.json({ error: 'Hiányzó adatok' }, { status: 400 })
    }

    const docRef = await db.collection('monthlyBehavior').add({
      studentId,
      studentName,
      studentClass,
      month,
      diligence,
      behavior,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({
      id: docRef.id,
      studentId,
      studentName,
      studentClass,
      month,
      diligence,
      behavior,
      createdAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Hiba a havi szorgalom rögzítésekor:', error)
    return NextResponse.json({ error: 'Rögzítési hiba' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, diligence, behavior } = body

    if (!id) {
      return NextResponse.json({ error: 'ID szükséges' }, { status: 400 })
    }

    await db.collection('monthlyBehavior').doc(id).update({
      diligence,
      behavior,
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hiba a havi szorgalom frissítésekor:', error)
    return NextResponse.json({ error: 'Frissítési hiba' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID szükséges' }, { status: 400 })
    }

    await db.collection('monthlyBehavior').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Hiba a havi szorgalom törlésekor:', error)
    return NextResponse.json({ error: 'Törlési hiba' }, { status: 500 })
  }
}
