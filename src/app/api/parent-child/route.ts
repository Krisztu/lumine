import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const parentId = searchParams.get('parentId')

    if (studentId) {
      const snapshot = await db.collection('parent_children')
        .where('childId', '==', studentId)
        .get()

      const parents = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()
          const parentDoc = await db.collection('users').doc(data.parentId).get()
          const parentData = parentDoc.data()
          
          return {
            id: data.parentId,
            name: parentData?.fullName || parentData?.name,
            email: parentData?.email,
            phone: parentData?.phone,
            relationship: data.relationship,
            linkedAt: data.linkedAt
          }
        })
      )

      return NextResponse.json(parents)
    }

    if (parentId) {
      const snapshot = await db.collection('parent_children')
        .where('parentId', '==', parentId)
        .get()

      const children = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()
          const childDoc = await db.collection('users').doc(data.childId).get()
          const childData = childDoc.data()
          
          return {
            id: doc.id,
            childId: data.childId,
            childName: childData?.fullName || childData?.name,
            childClass: childData?.class,
            childStudentId: childData?.studentId,
            childEmail: childData?.email,
            profileImage: childData?.profileImage,
            relationship: data.relationship,
            linkedAt: data.linkedAt
          }
        })
      )

      return NextResponse.json(children)
    }

    return NextResponse.json({ error: 'studentId vagy parentId szükséges' }, { status: 400 })
  } catch (error) {
    console.error('Get parent-child error:', error)
    return NextResponse.json({ error: 'Lekérés sikertelen' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const childId = searchParams.get('childId')

    if (!parentId || !childId) {
      return NextResponse.json({ error: 'parentId és childId szükséges' }, { status: 400 })
    }

    const snapshot = await db.collection('parent_children')
      .where('parentId', '==', parentId)
      .where('childId', '==', childId)
      .get()

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Kapcsolat nem található' }, { status: 404 })
    }

    await snapshot.docs[0].ref.delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete parent-child error:', error)
    return NextResponse.json({ error: 'Törlés sikertelen' }, { status: 500 })
  }
}
