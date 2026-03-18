import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const childId = searchParams.get('childId')

    if (!parentId || !childId) {
      return NextResponse.json({ error: 'parentId és childId szükséges' }, { status: 400 })
    }

    await db.collection('parent_children').doc(`${parentId}__${childId}`).delete()

    const parentRef = db.collection('users').doc(parentId)
    await parentRef.update({
      children: FieldValue.arrayRemove(childId)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unlink child error:', error)
    return NextResponse.json({ error: 'Gyermek eltávolítása sikertelen' }, { status: 500 })
  }
}
