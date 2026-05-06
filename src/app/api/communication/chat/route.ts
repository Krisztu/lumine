import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const { message, sender } = await request.json()

    if (!message || !sender) {
      return NextResponse.json({ error: 'Hiányzó mezők' }, { status: 400 })
    }

    const chatMessage = {
      message: message.trim(),
      sender: sender.trim(),
      createdAt: new Date().toISOString()
    }

    const docRef = await db.collection('chatMessages').add(chatMessage)

    return NextResponse.json({ id: docRef.id, ...chatMessage })
  } catch (error) {
    console.error('Chat POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült elküldeni az üzenetet' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection('chatMessages')
      .limit(100)
      .get()

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    }))

    messages.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime()
      const dateB = new Date(b.createdAt || 0).getTime()
      return dateA - dateB
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Chat GET Error:', error)
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