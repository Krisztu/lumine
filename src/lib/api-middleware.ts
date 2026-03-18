import { NextRequest, NextResponse } from 'next/server'
import { hasPermission, type UserRole } from './permissions'

export interface AuthContext {
  userId: string
  email: string
  role: UserRole
}

export function getAuthContext(request: NextRequest): AuthContext | null {
  const userId = request.headers.get('x-user-id')
  const email = request.headers.get('x-user-email')
  const role = request.headers.get('x-user-role') as UserRole

  if (!userId || !email || !role) {
    return null
  }

  return { userId, email, role }
}

export function requirePermission(permission: keyof import('./permissions').Permissions) {
  return (handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      const auth = getAuthContext(req)

      if (!auth) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      if (!hasPermission(auth.role, permission)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }

      return handler(req, auth)
    }
  }
}
