import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'
import { hasPermission } from '@/lib/permissions'

export async function POST(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role') as any
    
    if (!hasPermission(role, 'canChatWithTeachers')) {
      return NextResponse.json({ error: 'Nincs engedélye üzeneteket küldeni' }, { status: 403 })
    }

    const { message, userId, userName } = await request.json()

    const chatMessage = {
      message,
      userId,
      userName,
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection('chatMessages').add(chatMessage)

    return NextResponse.json({ id: docRef.id, ...chatMessage })
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült elküldeni az üzenetet' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection('chatMessages')
      .orderBy('createdAt', 'desc')
      .limit(100)
      .get()

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).reverse()

    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült lekérni az üzeneteket' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Üzenet azonosító szükséges' }, { status: 400 })
    }

    await db.collection('chatMessages').doc(id).delete()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Nem sikerült törölni az üzenetet' }, { status: 500 })
  }
}
