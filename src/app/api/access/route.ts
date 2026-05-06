import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { studentId, action } = await request.json()

    if (!studentId || !action) {
      return NextResponse.json({ success: false, error: 'Hiányzó adatok' }, { status: 400 })
    }

    // Felhasználó nevének lekérése
    let studentName = 'Diák'
    try {
      // Firebase Auth felhasználó lekérése
      const auth = require('firebase-admin/auth')
      const userRecord = await auth.getAuth().getUser(studentId)
      const userEmail = userRecord.email
      
      if (userEmail) {
        // Felhasználó keresése email alapján
        const usersSnapshot = await db.collection('users').where('email', '==', userEmail).limit(1).get()
        if (!usersSnapshot.empty) {
          const userData = usersSnapshot.docs[0].data()
          studentName = userData?.fullName || userData?.name || 'Diák'
        }
      }
    } catch (error) {
      // Fallback: próbáljuk meg közvetlenül a studentId-val
      try {
        const userDoc = await db.collection('users').doc(studentId).get()
        if (userDoc.exists) {
          const userData = userDoc.data()
          studentName = userData?.fullName || userData?.name || 'Diák'
        }
      } catch (fallbackError) {
        // Ha semmi sem működik, marad a 'Diák'
      }
    }

    const now = new Date()
    const today = now.toISOString().split('T')[0]

    const accessRef = db.collection('access').doc(`${studentId}_${today}`)
    const accessDoc = await accessRef.get()
    const accessData = accessDoc.data()

    if (action === 'entry') {
      // Ha már kilépett, akkor újra beléphet
      if (accessData?.exitTime) {
        // Új belépési rekord létrehozása
        await accessRef.update({
          entryTime: now.toISOString(),
          exitTime: null // Kilépési idő törlése
        })
      } else if (accessData?.entryTime) {
        return NextResponse.json({
          success: false,
          error: 'Már beléptél ma!'
        }, { status: 400 })
      } else {
        // Első belépés
        await accessRef.set({
          studentId,
          entryTime: now.toISOString(),
          date: today
        }, { merge: true })
      }

      return NextResponse.json({
        success: true,
        action: 'entry',
        studentName
      })
    } else {
      if (!accessData?.entryTime) {
        return NextResponse.json({
          success: false,
          error: 'Először be kell lépned!'
        }, { status: 400 })
      }

      if (accessData?.exitTime) {
        return NextResponse.json({
          success: false,
          error: 'Már kiléptél ma!'
        }, { status: 400 })
      }

      // Hétvégén bármikor kiléphet
      const dayOfWeek = now.getDay() // 0 = vasárnap, 6 = szombat
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      
      let canExit = isWeekend
      
      if (!isWeekend) {
        // Hétköznap: órarend alapján ellenőrzés
        try {
          // Diák órarendjének lekérése
          const userDoc = await db.collection('users').doc(studentId).get()
          if (userDoc.exists) {
            const userData = userDoc.data()
            const studentClass = userData?.class
            
            if (studentClass) {
              // Mai órák lekérése
              const dayNames = ['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat']
              const todayName = dayNames[dayOfWeek]
              
              const lessonsSnapshot = await db.collection('lessons')
                .where('className', '==', studentClass)
                .where('day', '==', todayName)
                .get()
              
              if (!lessonsSnapshot.empty) {
                const lessons = lessonsSnapshot.docs.map(doc => doc.data())
                const currentTime = now.getHours() * 60 + now.getMinutes()
                
                // Utolsó óra végének megkeresése
                let lastLessonEnd = 0
                lessons.forEach(lesson => {
                  const [hours, minutes] = lesson.startTime.split(':').map(Number)
                  const lessonStart = hours * 60 + minutes
                  const lessonEnd = lessonStart + 45 // 45 perces órák
                  if (lessonEnd > lastLessonEnd) {
                    lastLessonEnd = lessonEnd
                  }
                })
                
                canExit = currentTime >= lastLessonEnd
              } else {
                // Nincs óra ma, kiléphet
                canExit = true
              }
            } else {
              // Nincs osztály megadva, alapértelmezett 14:00
              canExit = now.getHours() >= 14
            }
          } else {
            // Felhasználó nem található, alapértelmezett 14:00
            canExit = now.getHours() >= 14
          }
        } catch (error) {
          console.error('Error checking schedule:', error)
          // Hiba esetén alapértelmezett 14:00
          canExit = now.getHours() >= 14
        }
      }

      if (canExit) {
        await accessRef.update({
          exitTime: now.toISOString()
        })

        return NextResponse.json({
          success: true,
          action: 'exit',
          canExit: true,
          studentName
        })
      } else {
        return NextResponse.json({
          success: true,
          action: 'exit',
          canExit: false,
          studentName
        })
      }
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Szerver hiba'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const accessDocs = await db.collection('access').orderBy('entryTime', 'desc').limit(50).get()
    const accessLogs = accessDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    return NextResponse.json(accessLogs)
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült lekérni a belépési naplót' }, { status: 500 })
  }
}