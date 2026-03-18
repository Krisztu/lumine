import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { hasPermission } from '@/lib/permissions'

const LESSONS_CACHE_DURATION = 5 * 60 * 1000
const memoryCache = new Map<string, { data: any, timestamp: number }>()

function getCachedData(key: string, duration: number = LESSONS_CACHE_DURATION) {
  const cached = memoryCache.get(key)
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  if (memoryCache.size > 30) {
    const oldestKey = memoryCache.keys().next().value
    memoryCache.delete(oldestKey)
  }
  
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, startTime, subject, teacherName, className, room } = body
    const userRole = request.headers.get('x-user-role')

    if (!day || !startTime || !subject || !teacherName || !className) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    // Jogosultság ellenőrzés - csak admin hozhat létre órákat
    if (userRole !== 'admin') {
      return NextResponse.json({ error: 'Nincs jogosultság órák létrehozásához' }, { status: 403 })
    }

    const usersSnapshot = await db.collection('users')
      .select('id', 'fullName', 'name', 'role', 'class', 'email')
      .get()
    
    const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }))

    const teacher = allUsers.find((user: any) => (user.fullName || user.name) === teacherName)
    if (!teacher) {
      return NextResponse.json({ error: 'Tanár nem található' }, { status: 400 })
    }

    // Az érintett felhasználók: tanár + osztály diákjai
    const classStudents = allUsers.filter((user: any) =>
      (user.role === 'student' || user.role === 'dj') && user.class === className
    )

    if (classStudents.length === 0) {
      return NextResponse.json({ error: `Nem találhatók diákok a(z) ${className} osztályban` }, { status: 400 })
    }

    const affectedUsers = [teacher, ...classStudents]

    const conflictSnapshot = await db.collection('lessons')
      .where('day', '==', day)
      .where('startTime', '==', startTime)
      .where('userId', 'in', affectedUsers.slice(0, 10).map(u => u.id || u.email))
      .select('userId', 'subject', 'teacherName')
      .get()

    if (!conflictSnapshot.empty) {
      const conflictLesson = conflictSnapshot.docs[0].data()
      const conflictUser = affectedUsers.find(u => (u.id || u.email) === conflictLesson.userId)
      return NextResponse.json({
        error: `${conflictUser?.fullName || conflictUser?.name} már foglalt ezen az időponton: ${conflictLesson.subject} (${conflictLesson.teacherName})`
      }, { status: 409 })
    }

    const batch = db.batch()

    affectedUsers.forEach(user => {
      const newLessonRef = db.collection('lessons').doc()
      batch.set(newLessonRef, {
        day,
        startTime,
        subject,
        teacherName,
        className,
        room: room || '',
        userId: user.id || user.email,
        userRole: user.role,
        createdAt: new Date().toISOString()
      })
    })

    await batch.commit()

    memoryCache.clear()

    return NextResponse.json({
      success: true,
      message: `Óra rögzítve ${affectedUsers.length} felhasználónak (1 tanár + ${classStudents.length} diák)`,
      affectedUsers: affectedUsers.length,
      className,
      subject,
      teacherName
    })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni az órát' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('class')
    const teacherName = searchParams.get('teacher')
    const userId = searchParams.get('userId')
    const userRole = request.headers.get('x-user-role')
    const useCache = searchParams.get('cache') !== 'false'

    if (!userRole) {
      return NextResponse.json({ error: 'Nincs jogosultság' }, { status: 403 })
    }

    const cacheKey = userId ? `lessons_user_${userId}` : 
                    className ? `lessons_class_${className}` :
                    teacherName ? `lessons_teacher_${teacherName}` : 'lessons_all'

    if (useCache) {
      const cached = getCachedData(cacheKey)
      if (cached) {
        return NextResponse.json(cached)
      }
    }

    let lessonsQuery: FirebaseFirestore.Query = db.collection('lessons')

    if (userId) {
      lessonsQuery = lessonsQuery
        .where('userId', '==', userId)
        .select('id', 'day', 'startTime', 'subject', 'teacherName', 'className', 'room', 'userId')
        .limit(50)
      
      const lessonsSnapshot = await lessonsQuery.get()
      let lessons = lessonsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      if (lessons.length === 0) {
        const userSnapshot = await db.collection('users')
          .where('id', '==', userId)
          .select('email')
          .limit(1)
          .get()
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data() as any
          if (userData?.email) {
            const emailQuery = db.collection('lessons')
              .where('userId', '==', userData.email)
              .select('id', 'day', 'startTime', 'subject', 'teacherName', 'className', 'room', 'userId')
              .limit(50)
            
            const emailSnapshot = await emailQuery.get()
            lessons = emailSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }))
          }
        }
      }

      if (useCache) {
        setCachedData(cacheKey, lessons)
      }
      
      return NextResponse.json(lessons)
    } else if (className) {
      const classLessonsQuery = db.collection('lessons')
        .where('className', '==', className)
        .select('id', 'day', 'startTime', 'subject', 'teacherName', 'className', 'room')
        .limit(100)
      
      const classLessonsSnapshot = await classLessonsQuery.get()
      
      const uniqueLessons = new Map()
      classLessonsSnapshot.docs.forEach(doc => {
        const lesson = { id: doc.id, ...doc.data() }
        const key = `${(lesson as any).day}-${(lesson as any).startTime}`
        if (!uniqueLessons.has(key)) {
          uniqueLessons.set(key, lesson)
        }
      })
      
      const lessons = Array.from(uniqueLessons.values())
      
      if (useCache) {
        setCachedData(cacheKey, lessons)
      }
      
      return NextResponse.json(lessons)
    } else if (teacherName) {
      lessonsQuery = lessonsQuery
        .where('teacherName', '==', teacherName)
        .select('id', 'day', 'startTime', 'subject', 'teacherName', 'className', 'room')
        .limit(50)
    } else {
      lessonsQuery = lessonsQuery
        .select('id', 'day', 'startTime', 'subject', 'teacherName', 'className', 'room')
        .limit(100)
    }

    const lessonsSnapshot = await lessonsQuery.get()
    const lessons = lessonsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    if (useCache) {
      setCachedData(cacheKey, lessons)
    }

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni az órákat' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { day, startTime, className, subject, teacherName } = body

    if (!day || !startTime) {
      return NextResponse.json({ 
        error: `Hiányzó kötelező mezők. Kapott: day=${day}, startTime=${startTime}` 
      }, { status: 400 })
    }

    let lessonsQuery = db.collection('lessons')
      .where('day', '==', day)
      .where('startTime', '==', startTime)

    if (className) lessonsQuery = lessonsQuery.where('className', '==', className)
    if (subject) lessonsQuery = lessonsQuery.where('subject', '==', subject)
    if (teacherName) lessonsQuery = lessonsQuery.where('teacherName', '==', teacherName)

    const lessonsSnapshot = await lessonsQuery.get()

    let changesQuery = db.collection('schedule-changes')
      .where('timeSlot', '==', startTime)

    const changesSnapshot = await changesQuery.get()
    
    if (lessonsSnapshot.empty && changesSnapshot.empty) {
      return NextResponse.json({ 
        error: `Nem található óra. Paraméterek: day=${day}, startTime=${startTime}, className=${className}` 
      }, { status: 404 })
    }

    const batch = db.batch()
    let deletedCount = 0

    lessonsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
      deletedCount++
    })

    changesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
      deletedCount++
    })

    await batch.commit()

    memoryCache.clear()

    return NextResponse.json({ 
      success: true, 
      message: `${deletedCount} rekord törölve (lessons: ${lessonsSnapshot.docs.length}, changes: ${changesSnapshot.docs.length})`,
      deletedCount
    })
  } catch (error) {
    console.error('Error deleting lessons:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni az órákat: ' + error }, { status: 500 })
  }
}