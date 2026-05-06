import { NextRequest, NextResponse } from 'next/server'
import { auth, db as adminDb } from '@/lib/firebase-admin'
import { auth as clientAuth } from '@/lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, fullName, role, subject, classes, studentId, class: userClass } = body

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    const userCredential = await createUserWithEmailAndPassword(clientAuth, email, password)
    const user = userCredential.user

    const userData: any = {
      uid: user.uid,
      email: user.email,
      fullName,
      role,
      phone: body.phone || '',
      address: body.address || '',
      createdAt: new Date().toISOString()
    }

    if (role === 'teacher' || role === 'homeroom_teacher') {
      userData.subject = subject || ''
      userData.classes = classes || []
      if (role === 'homeroom_teacher' && userClass) {
        userData.class = userClass
      }
    } else if (role === 'student' || role === 'dj') {
      userData.studentId = studentId || ''
      userData.class = userClass || '12.A'
    } else if (role === 'parent') {
      userData.children = []
      userData.childrenStudentIds = body.childStudentId ? [body.childStudentId] : []
      
      // Gyermek hozzáadása regisztráció során
      if (body.childStudentId) {
        try {
          const childQuery = adminDb.collection('users')
            .where('studentId', '==', body.childStudentId)
            .where('role', 'in', ['student', 'dj'])
          
          const childSnapshot = await childQuery.get()
          if (!childSnapshot.empty) {
            const childDoc = childSnapshot.docs[0]
            userData.children = [childDoc.id]
            
            // Parent-child kapcsolat létrehozása
            await adminDb.collection('parent_children').doc(`${user.uid}__${childDoc.id}`).set({
              parentId: user.uid,
              childId: childDoc.id,
              childName: childDoc.data().fullName || childDoc.data().name,
              childClass: childDoc.data().class,
              childStudentId: body.childStudentId,
              relationship: body.relationship || 'egyeb',
              linkedAt: new Date().toISOString(),
              verified: true
            })
          }
        } catch (error) {
          console.error('Child linking failed:', error)
        }
      }
    } else if (role === 'principal') {
      // Principal has no additional fields
    }

    await adminDb.collection('users').doc(user.uid).set(userData)

    try {
      await auth.setCustomUserClaims(user.uid, {
        role: userData.role,
        name: userData.fullName
      })
    } catch (error) {
      console.error('Failed to set custom claims:', error)
    }

    if ((role === 'student' || role === 'dj') && userData.class) {
      try {
        const classStudentsQuery = adminDb.collection('users')
          .where('class', '==', userData.class)
          .where('role', 'in', ['student', 'dj'])

        const classStudentsSnapshot = await classStudentsQuery.get()

        if (!classStudentsSnapshot.empty) {
          const classmate = classStudentsSnapshot.docs[0]

          const lessonsQuery = adminDb.collection('lessons')
            .where('userId', '==', classmate.id)

          const lessonsSnapshot = await lessonsQuery.get()

          const lessonPromises = lessonsSnapshot.docs.map(lessonDoc => {
            const lesson = lessonDoc.data()
            return adminDb.collection('lessons').add({
              userId: user.uid,
              day: lesson.day,
              startTime: lesson.startTime,
              subject: lesson.subject,
              teacherName: lesson.teacherName,
              className: lesson.className,
              room: lesson.room || '',
              createdAt: new Date().toISOString()
            })
          })

          await Promise.all(lessonPromises)
        }
      } catch (error) {
        console.error('Schedule copy failed:', error)
      }
    }

    return NextResponse.json({
      success: true,
      uid: user.uid,
      message: 'Felhasználó sikeresen regisztrálva'
    })
  } catch (error: any) {

    let errorMessage = 'Sikertelen regisztráció'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Ez az email cím már használatban van'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A jelszó túl gyenge (minimum 6 karakter)'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Érvénytelen email cím'
    }

    console.error('Register POST Error:', error)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}