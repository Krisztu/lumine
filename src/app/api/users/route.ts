import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/lib/firebase-admin'
import { hasPermission } from '@/lib/permissions'

const USERS_CACHE_DURATION = 10 * 60 * 1000
const memoryCache = new Map<string, { data: any, timestamp: number }>()

function getCachedData(key: string, duration: number = USERS_CACHE_DURATION) {
  const cached = memoryCache.get(key)
  if (cached && Date.now() - cached.timestamp < duration) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  if (memoryCache.size > 50) {
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
    const role = request.headers.get('x-user-role') as any
    
    if (!hasPermission(role, 'canEditUsers')) {
      return NextResponse.json({ error: 'Nincs engedélye felhasználókat létrehozni' }, { status: 403 })
    }

    const body = await request.json()
    const { uid, email, fullName, studentId, role: newRole, subject, classes, phone, address } = body

    if (!uid || !email || !newRole) {
      return NextResponse.json({ error: 'Hiányzó kötelező mezők' }, { status: 400 })
    }

    let assignedClass = body.class

    if (newRole === 'student' && !assignedClass) {
      const availableClasses = ['12.A', '12.B']
      const randomIndex = Math.floor(Math.random() * availableClasses.length)
      assignedClass = availableClasses[randomIndex]
    }

    const userData: any = {
      uid,
      email,
      fullName: fullName || '',
      studentId: studentId || '',
      role: newRole,
      class: assignedClass,
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString()
    }

    if (newRole === 'teacher') {
      if (subject) userData.subject = subject
      if (classes) userData.classes = classes
    }

    const userRef = await db.collection('users').add(userData)

    memoryCache.clear()

    return NextResponse.json({
      success: true,
      id: userRef.id,
      class: assignedClass,
      lessonsAdded: 'Üres órarend - manuálisan kell hozzáadni'
    })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({
      error: 'Nem sikerült létrehozni a felhasználót',
      details: (error as any)?.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role') as any
    const userId = request.headers.get('x-user-id')
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const queryRole = searchParams.get('role')
    const useCache = searchParams.get('cache') !== 'false'

    if (email) {
      const cacheKey = `user_email_${email}`
      
      if (useCache) {
        const cached = getCachedData(cacheKey)
        if (cached) {
          return NextResponse.json(cached)
        }
      }
      
      const query = db.collection('users')
        .where('email', '==', email)
        .select('id', 'email', 'fullName', 'role', 'class', 'phone', 'address', 'profileImage')
        .limit(1)
      
      const usersSnapshot = await query.get()
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      if (useCache) {
        setCachedData(cacheKey, users)
      }
      
      return NextResponse.json(users)
    }

    if (role === 'parent') {
      if (queryRole === 'teacher') {
        const cacheKey = 'users_teachers_for_parents'
        
        if (useCache) {
          const cached = getCachedData(cacheKey)
          if (cached) {
            return NextResponse.json(cached)
          }
        }
        
        const teachersSnapshot = await db.collection('users')
          .where('role', '==', 'teacher')
          .select('id', 'fullName', 'email', 'subject')
          .limit(20)
          .get()
        
        const teachers = teachersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        if (useCache) {
          setCachedData(cacheKey, teachers)
        }
        
        return NextResponse.json(teachers)
      }
      return NextResponse.json({ error: 'Nincs engedélye felhasználókat megtekinteni' }, { status: 403 })
    }

    if (!role || !hasPermission(role, 'canViewAllUsers')) {
      return NextResponse.json({ error: 'Nincs engedélye felhasználókat megtekinteni' }, { status: 403 })
    }

    const cacheKey = queryRole ? `users_role_${queryRole}` : 'users_all'
    
    if (useCache) {
      const cached = getCachedData(cacheKey, 0)
      if (cached) {
        return NextResponse.json(cached)
      }
    }
    
    let query: FirebaseFirestore.Query = db.collection('users')

    if (queryRole) {
      query = query.where('role', '==', queryRole)
    }

    query = query.limit(100).select(
      'id', 'email', 'fullName', 'role', 'class', 'phone', 'address', 
      'subject', 'studentId', 'createdAt', 'profileImage'
    )

    const usersSnapshot = await query.get()
    const users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    const response = NextResponse.json(users)
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({
      error: 'Nem sikerült lekérni a felhasználókat',
      details: (error as any)?.message || 'Ismeretlen hiba'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role') as any
    const userId = request.headers.get('x-user-id')
    
    const body = await request.json()
    const { id, role: newRole, class: userClass, fullName, phone, address } = body

    const isProfileImageOnly = body.profileImage && !newRole && !userClass && !fullName
    
    if (!isProfileImageOnly && !hasPermission(role, 'canEditUsers')) {
      return NextResponse.json({ error: 'Nincs engedélye felhasználókat módosítani' }, { status: 403 })
    }

    const updateData: any = {
      updatedAt: new Date().toISOString()
    }

    if (newRole) updateData.role = newRole
    if (userClass) updateData.class = userClass
    if (fullName) updateData.fullName = fullName
    if (phone) updateData.phone = phone
    if (address) updateData.address = address
    if (body.profileImage) updateData.profileImage = body.profileImage

    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(id)
      transaction.update(userRef, updateData)
    })

    memoryCache.clear()

    if (newRole || fullName) {
      try {
        const userDoc = await db.collection('users').doc(id).get()
        const userData = userDoc.data()
        if (userData?.uid) {
          await auth.setCustomUserClaims(userData.uid, {
            role: newRole || userData.role,
            name: fullName || userData.fullName
          })
        }
      } catch (error) {
        console.error('Failed to update custom claims:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Nem sikerült frissíteni a felhasználót' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role') as any
    
    if (!hasPermission(role, 'canEditUsers')) {
      return NextResponse.json({ error: 'Nincs engedélye felhasználókat törölni' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Felhasználó azonosító szükséges' }, { status: 400 })
    }

    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(id)
      const userDoc = await transaction.get(userRef)

      if (!userDoc.exists) {
        throw new Error('Felhasználó nem található')
      }

      const userData = userDoc.data()
      
      if (userData?.uid) {
        try {
          await auth.deleteUser(userData.uid)
        } catch (authError) {
          console.error('Auth user deletion failed:', authError)
        }
      }

      transaction.delete(userRef)
    })

    memoryCache.clear()

    return NextResponse.json({
      success: true,
      message: 'Felhasználó törölve Firebase Auth-ból és Firestore-ból',
      deletedId: id
    })
  } catch (error: any) {
    return NextResponse.json({
      error: 'Nem sikerült törölni a felhasználót'
    }, { status: 500 })
  }
}