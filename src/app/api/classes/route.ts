import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { hasPermission } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const classesSnapshot = await db.collection('classes').get()
    const classes = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    }))
    
    const response = NextResponse.json(classes.map((cls: any) => ({ name: cls.name })))
    
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('Classes GET Error:', error)
    return NextResponse.json({ error: 'Nem sikerült lekérni az osztályokat' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (!hasPermission(userRole, 'canEditUsers')) {
      return NextResponse.json({ error: 'Nincs engedélye osztály létrehozásához' }, { status: 403 })
    }
    
    const { name } = await request.json()
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Osztály név szükséges' }, { status: 400 })
    }
    
    const className = name.trim()
    
    const existingClass = await db.collection('classes').where('name', '==', className).get()
    if (!existingClass.empty) {
      return NextResponse.json({ error: 'Ez az osztály már létezik' }, { status: 400 })
    }
    
    const classData = {
      name: className,
      createdAt: new Date().toISOString()
    }
    
    const classRef = await db.collection('classes').add(classData)
    
    return NextResponse.json({ 
      success: true, 
      id: classRef.id, 
      name: className 
    })
  } catch (error) {
    console.error('Classes POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült létrehozni az osztályt' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role')
    
    if (!hasPermission(userRole, 'canEditUsers')) {
      return NextResponse.json({ error: 'Nincs engedélye osztály törléséhez' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const className = searchParams.get('name')
    
    if (!className) {
      return NextResponse.json({ error: 'Osztály név szükséges' }, { status: 400 })
    }
    
    const usersInClass = await db.collection('users').where('class', '==', className).get()
    if (!usersInClass.empty) {
      return NextResponse.json({ 
        error: `Nem törölhető! Az osztályban ${usersInClass.size} felhasználó van.` 
      }, { status: 400 })
    }
    
    const classQuery = await db.collection('classes').where('name', '==', className).get()
    if (classQuery.empty) {
      return NextResponse.json({ error: 'Osztály nem található' }, { status: 404 })
    }
    
    const batch = db.batch()
    classQuery.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    await batch.commit()
    
    return NextResponse.json({ success: true, message: `Osztály törölve: ${className}` })
  } catch (error) {
    console.error('Classes DELETE Error:', error)
    return NextResponse.json({ error: 'Nem sikerült törölni az osztályt' }, { status: 500 })
  }
}