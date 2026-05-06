import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/lib/firebase-admin'

export async function POST() {
  try {
    const usersSnapshot = await db.collection('users').get()
    const results = []

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data()
      if (userData.uid && userData.role) {
        try {
          await auth.setCustomUserClaims(userData.uid, {
            role: userData.role,
            name: userData.fullName || userData.name || ''
          })
          results.push({ email: userData.email, role: userData.role, status: 'success' })
        } catch (error) {
          results.push({ email: userData.email, role: userData.role, status: 'failed' })
        }
      }
    }

    return NextResponse.json({
      message: 'Szerepkörök beállítva',
      count: results.length
    })
  } catch (error) {
    console.error('Set Roles POST Error:', error)
    return NextResponse.json({ error: 'Nem sikerült beállítani a szerepköröket' }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}