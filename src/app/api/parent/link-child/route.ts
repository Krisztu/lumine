import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { parentId, childStudentId, relationship } = body

    if (!parentId || !childStudentId) {
      return NextResponse.json({ error: 'Hiányzó mezők' }, { status: 400 })
    }

    const childSnapshot = await db.collection('users')
      .where('studentId', '==', childStudentId)
      .where('role', 'in', ['student', 'dj'])
      .get()

    if (childSnapshot.empty) {
      return NextResponse.json({ error: 'Gyermek nem található' }, { status: 404 })
    }

    const childDoc = childSnapshot.docs[0]
    const childId = childDoc.id
    const childData = childDoc.data()

    await db.collection('parent_children').doc(`${parentId}__${childId}`).set({
      parentId,
      childId,
      childName: childData.fullName || childData.name,
      childClass: childData.class,
      childStudentId,
      relationship: relationship || 'szülő',
      linkedAt: new Date().toISOString(),
      verified: true
    })

    const parentRef = db.collection('users').doc(parentId)
    await parentRef.update({
      children: FieldValue.arrayUnion(childId)
    })

    return NextResponse.json({ success: true, childId })
  } catch (error) {
    console.error('Link child error:', error)
    return NextResponse.json({ error: 'Gyermek összekapcsolása sikertelen' }, { status: 500 })
  }
}
