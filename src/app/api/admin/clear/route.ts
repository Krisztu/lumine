import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { fullReset } = body

    if (fullReset) {
      // Teljes adatbázis tisztítás
      const collections = [
        'users', 'lessons', 'grades', 'attendance', 'homework', 
        'homework_submissions', 'chat_messages', 'music_requests',
        'behavior_records', 'justifications', 'parent_child_links',
        'absences'
      ]
      
      let totalDeleted = 0
      
      for (const collectionName of collections) {
        const snapshot = await db.collection(collectionName).get()
        const batch = db.batch()
        
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref)
          totalDeleted++
        })
        
        if (snapshot.docs.length > 0) {
          await batch.commit()
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Adatbázis teljesen tisztítva',
        totalDeleted
      })
    } else {
      // Régi funkció - csak mulasztások és órák
      const absencesSnapshot = await db.collection('absences').get()
      const absenceDeletePromises = absencesSnapshot.docs.map(doc => doc.ref.delete())
      await Promise.all(absenceDeletePromises)

      const attendanceSnapshot = await db.collection('attendance').get()
      const attendanceDeletePromises = attendanceSnapshot.docs.map(doc => doc.ref.delete())
      await Promise.all(attendanceDeletePromises)

      const lessonsSnapshot = await db.collection('lessons').get()
      const lessonDeletePromises = lessonsSnapshot.docs.map(doc => doc.ref.delete())
      await Promise.all(lessonDeletePromises)

      return NextResponse.json({
        success: true,
        message: `Adatbázis törölve: ${absencesSnapshot.docs.length} mulasztás, ${attendanceSnapshot.docs.length} jelenléti adat és ${lessonsSnapshot.docs.length} óra törölve`,
        absencesDeleted: absencesSnapshot.docs.length,
        attendanceDeleted: attendanceSnapshot.docs.length,
        lessonsDeleted: lessonsSnapshot.docs.length
      })
    }
  } catch (error: any) {
    console.error('Clear DELETE Error:', error)
    return NextResponse.json({
      error: 'Adatbázis törlése sikertelen'
    }, { status: 500 })
  }
}