import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { hasPermission } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, studentClass, subject, grade, title, description, teacherName, studentId, type, isBehaviorGrade } = body
    const userRole = request.headers.get('x-user-role')

    if (!studentName || !grade || !title || !teacherName) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    // Jogosultság ellenőrzés
    if (!hasPermission(userRole, 'canEditGrades')) {
      return NextResponse.json({ error: 'Nincs jogosultság jegyek létrehozásához' }, { status: 403 })
    }

    // Ellenőrizzük, hogy a tanár tanítja-e ezt az osztályt/tantárgyat
    // Kivéve magatartás és szorgalom jegyek esetén (csak osztályfőnökök adhatják)
    if (subject !== 'Magatartás' && subject !== 'Szorgalom') {
      const lessonsQuery = await db.collection('lessons')
        .where('teacherName', '==', teacherName)
        .where('className', '==', studentClass)
        .where('subject', '==', subject)
        .get()

      if (lessonsQuery.empty) {
        return NextResponse.json({ 
          error: 'Nincs jogosultsága jegyet adni ehhez az osztályhoz/tantárgyhoz' 
        }, { status: 403 })
      }
    } else {
      // Magatartás és szorgalom jegyek esetén ellenőrizzük, hogy osztályfőnök-e
      if (userRole !== 'homeroom_teacher') {
        return NextResponse.json({ 
          error: 'Csak osztályfőnökök adhatnak magatartás és szorgalom jegyeket' 
        }, { status: 403 })
      }
    }

    const sanitizedData = {
      studentName: studentName.trim().substring(0, 100),
      studentId: (studentId || '').trim(),
      studentClass: (studentClass || '').trim().substring(0, 10),
      subject: (subject || 'Egyéb').trim().substring(0, 50),
      grade: Math.max(1, Math.min(5, parseInt(grade))),
      title: title.trim().substring(0, 100),
      description: (description || '').trim().substring(0, 500),
      teacherName: (teacherName || '').trim().substring(0, 100),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: type || '',
      isBehaviorGrade: isBehaviorGrade || false
    }

    const gradeDoc = await db.collection('grades').add(sanitizedData)

    return NextResponse.json({ success: true, id: gradeDoc.id })
  } catch (error) {
    console.error('Grades POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni a jegyet' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentName = searchParams.get('student')
    const studentClass = searchParams.get('class')
    const studentId = searchParams.get('studentId')
    const teacherName = searchParams.get('teacherName')
    const userRole = request.headers.get('x-user-role')

    // Jogosultság ellenőrzés
    if (!hasPermission(userRole, 'canViewGrades')) {
      return NextResponse.json({ error: 'Nincs jogosultság jegyek megtekintéséhez' }, { status: 403 })
    }

    let gradesQuery: FirebaseFirestore.Query = db.collection('grades')

    if (studentName) {
      gradesQuery = gradesQuery.where('studentName', '==', studentName)
    } else if (studentClass) {
      gradesQuery = gradesQuery.where('studentClass', '==', studentClass)
    } else if (studentId) {
      gradesQuery = gradesQuery.where('studentId', '==', studentId)
    }

    // Ha tanár név meg van adva, csak az általa adott jegyeket mutassa
    if (teacherName) {
      gradesQuery = gradesQuery.where('teacherName', '==', teacherName)
    }

    const gradesSnapshot = await gradesQuery.get()
    const grades = gradesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(grades)
  } catch (error) {
    console.error('Grades GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni a jegyeket' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body
    const userRole = request.headers.get('x-user-role')

    if (!id) {
      return NextResponse.json({ error: 'Jegy azonosító szükséges' }, { status: 400 })
    }

    // Jogosultság ellenőrzés
    if (!hasPermission(userRole, 'canEditGrades')) {
      return NextResponse.json({ error: 'Nincs jogosultság jegyek törléséhez' }, { status: 403 })
    }

    const gradeDoc = await db.collection('grades').doc(id).get()
    if (!gradeDoc.exists) {
      return NextResponse.json({ error: 'Jegy nem található' }, { status: 404 })
    }

    const gradeData = gradeDoc.data()
    
    // Magatartás és szorgalom jegyek esetén csak osztályfőnök és admin törölheti
    if (gradeData?.subject === 'Magatartás' || gradeData?.subject === 'Szorgalom') {
      if (userRole !== 'homeroom_teacher' && userRole !== 'admin') {
        return NextResponse.json({ 
          error: 'Csak osztályfőnökök és adminok törölhetnek magatartás/szorgalom jegyeket' 
        }, { status: 403 })
      }
    }

    await db.collection('grades').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Grade DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni a jegyet' }, { status: 500 })
  }
}