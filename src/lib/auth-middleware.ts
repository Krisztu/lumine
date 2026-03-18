import { NextRequest, NextResponse } from 'next/server'
import { auth } from './firebase-admin'

export async function verifyFirebaseToken(token: string) {
  try {
    const decodedToken = await auth.verifyIdToken(token)
    return decodedToken
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function authMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized - Missing token' }, { status: 401 })
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    const decodedToken = await auth.verifyIdToken(token)
    return { user: decodedToken }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }
}

export function requireRole(allowedRoles: string[]) {
  return (user: any) => {
    if (!user.role || !allowedRoles.includes(user.role)) {
      return NextResponse.json({ 
        error: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      }, { status: 403 })
    }
    return null
  }
}

export function requireAuth(handler: (request: NextRequest, user: any) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const authResult = await authMiddleware(request)
    
    if (authResult instanceof NextResponse) {
      return authResult
    }
    
    return handler(request, authResult.user)
  }
}