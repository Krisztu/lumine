import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const teacherId = searchParams.get('teacherId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    let behaviorQuery = db.collection('monthlyBehavior')

    if (studentId) {
      behaviorQuery = behaviorQuery.where('studentId', '==', studentId)
    }
    if (teacherId) {
      behaviorQuery = behaviorQuery.where('teacherId', '==', teacherId)
    }
    if (month && year) {
      behaviorQuery = behaviorQuery.where('month', '==', parseInt(month))
        .where('year', '==', parseInt(year))
    }

    const snapshot = await behaviorQuery.get()
    const monthlyBehavior = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json(monthlyBehavior)
  } catch (error) {
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { studentId, studentName, teacherId, teacherName, month, year, szorgalom, magatartas, megjegyzes } = data

    // Validáció
    if (!studentId || !teacherId || !month || !year || !szorgalom || !magatartas) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const monthNum = parseInt(month)
    const yearNum = parseInt(year)
    const szorgalomNum = parseInt(szorgalom)
    const magatartasNum = parseInt(magatartas)

    if (monthNum < 1 || monthNum > 12) {
      return NextResponse.json({ error: 'Hónap 1-12 között kell legyen' }, { status: 400 })
    }

    if (szorgalomNum < 1 || szorgalomNum > 5 || magatartasNum < 1 || magatartasNum > 5) {
      return NextResponse.json({ error: 'Jegyek 1-5 között kell legyenek' }, { status: 400 })
    }

    const existingQuery = await db.collection('monthlyBehavior')
      .where('studentId', '==', studentId)
      .where('month', '==', monthNum)
      .where('year', '==', yearNum)
      .get()

    if (!existingQuery.empty) {
      return NextResponse.json({ error: 'Már létezik értékelés erre a hónapra' }, { status: 400 })
    }

    const monthlyBehaviorData = {
      studentId,
      studentName,
      teacherId,
      teacherName,
      month: monthNum,
      year: yearNum,
      szorgalom: szorgalomNum,
      magatartas: magatartasNum,
      megjegyzes: megjegyzes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const docRef = await db.collection('monthlyBehavior').add(monthlyBehaviorData)
    
    return NextResponse.json({ 
      id: docRef.id, 
      ...monthlyBehaviorData,
      message: 'Havi értékelés sikeresen rögzítve' 
    })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, szorgalom, magatartas, megjegyzes } = data

    await db.collection('monthlyBehavior').doc(id).update({
      szorgalom: parseInt(szorgalom),
      magatartas: parseInt(magatartas),
      megjegyzes: megjegyzes || '',
      updatedAt: new Date()
    })

    return NextResponse.json({ message: 'Havi értékelés frissítve' })
  } catch (error) {
    return NextResponse.json({ error: 'Hiba történt' }, { status: 500 })
  }
}