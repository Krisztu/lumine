import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { Query } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentName, studentClass, subject, grade, title, description, teacherName, studentId } = body

    if (!studentName || !subject || !grade || !title || !teacherName) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    // Ellenőrizzük, hogy a tanár tanítja-e ezt az osztályt/tantárgyat
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

    const gradeDoc = await db.collection('grades').add({
      studentName,
      studentId: studentId || '',
      studentClass: studentClass || '',
      subject,
      grade: parseInt(grade),
      title,
      description: description || '',
      teacherName: teacherName || '',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })

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
    const teacherName = searchParams.get('teacherName')

    let gradesQuery: Query = db.collection('grades')

    if (studentName) {
      gradesQuery = gradesQuery.where('studentName', '==', studentName)
    } else if (studentClass) {
      gradesQuery = gradesQuery.where('studentClass', '==', studentClass)
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
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const teacherName = searchParams.get('teacherName')

    if (!id) {
      return NextResponse.json({ error: 'Jegy azonosító szükséges' }, { status: 400 })
    }

    // Ellenőrizzük, hogy a tanár törölheti-e ezt a jegyet
    if (teacherName) {
      const gradeDoc = await db.collection('grades').doc(id).get()
      if (!gradeDoc.exists) {
        return NextResponse.json({ error: 'Jegy nem található' }, { status: 404 })
      }

      const gradeData = gradeDoc.data()
      const lessonsQuery = await db.collection('lessons')
        .where('teacherName', '==', teacherName)
        .where('className', '==', gradeData?.studentClass)
        .where('subject', '==', gradeData?.subject)
        .get()

      if (lessonsQuery.empty) {
        return NextResponse.json({ 
          error: 'Nincs jogosultsága törölni ezt a jegyet' 
        }, { status: 403 })
      }
    }

    await db.collection('grades').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Grades DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni a jegyet' }, { status: 500 })
  }
}