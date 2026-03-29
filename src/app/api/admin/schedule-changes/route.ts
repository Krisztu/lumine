import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, date, timeSlot, changeType, newSubject, newTeacher, newClass, newRoom, originalTeacher, originalClass } = body

    if (!teacherId || !date || !timeSlot || !changeType) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const scheduleChange = {
      teacherId,
      date,
      timeSlot,
      changeType,
      originalTeacher: originalTeacher || '',
      originalClass: originalClass || '',
      newSubject: newSubject || '',
      newTeacher: newTeacher || '',
      newClass: newClass || '',
      newRoom: newRoom || '',
      createdAt: new Date().toISOString()
    }

    const changeDoc = await db.collection('schedule-changes').add(scheduleChange)

    return NextResponse.json({ success: true, id: changeDoc.id })
  } catch (error: any) {
    console.error('Schedule Changes POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni az órarend változtatást' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teacherId = searchParams.get('teacherId')
    const date = searchParams.get('date')

    let changesQuery: FirebaseFirestore.Query = db.collection('schedule-changes')

    if (teacherId && date) {
      changesQuery = changesQuery
        .where('teacherId', '==', teacherId)
        .where('date', '==', date)
    } else if (date) {
      changesQuery = changesQuery.where('date', '==', date)
    }

    const changesSnapshot = await changesQuery.get()
    const changes = changesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(changes)
  } catch (error: any) {
    console.error('Schedule Changes GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni az órarend változtatásokat' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { timeSlot, newSubject, newClass } = body

    console.log('DELETE schedule-changes:', body)

    if (!timeSlot) {
      return NextResponse.json({ error: 'Hiányzó timeSlot paraméter' }, { status: 400 })
    }

    // Keresés a schedule-changes kollekcióban
    let query = db.collection('schedule-changes')
      .where('timeSlot', '==', timeSlot)
      .where('changeType', '==', 'added')

    if (newSubject) {
      query = query.where('newSubject', '==', newSubject)
    }
    if (newClass) {
      query = query.where('newClass', '==', newClass)
    }

    const changesSnapshot = await query.get()
    console.log('Talált schedule-changes:', changesSnapshot.docs.length)

    if (changesSnapshot.empty) {
      return NextResponse.json({ 
        error: `Nem található hozzáadott óra: timeSlot=${timeSlot}, subject=${newSubject}, class=${newClass}` 
      }, { status: 404 })
    }

    // Batch törlés
    const batch = db.batch()
    changesSnapshot.docs.forEach(doc => {
      console.log('Törlés schedule-changes-ből:', doc.data())
      batch.delete(doc.ref)
    })

    await batch.commit()

    return NextResponse.json({ 
      success: true, 
      message: `${changesSnapshot.docs.length} órarend változtatás törölve`,
      deletedCount: changesSnapshot.docs.length
    })
  } catch (error: any) {
    console.error('Schedule Changes DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni az órarend változtatást' }, { status: 500 })
  }
}