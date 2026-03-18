import { User } from 'firebase/auth'

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>
}

interface UserData {
  id?: string
  email?: string
  role?: string
  uid?: string
}

export function createApiHeaders(currentUser?: UserData, user?: User): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (currentUser?.role) {
    headers['x-user-role'] = currentUser.role
  }

  if (currentUser?.id || user?.uid) {
    headers['x-user-id'] = currentUser?.id || user?.uid || ''
  }

  if (currentUser?.email || user?.email) {
    headers['x-user-email'] = currentUser?.email || user?.email || ''
  }

  return headers
}

export async function apiRequest(
  url: string, 
  options: ApiRequestOptions = {}, 
  currentUser?: UserData, 
  user?: User
): Promise<Response> {
  const headers = {
    ...createApiHeaders(currentUser, user),
    ...options.headers
  }

  return fetch(url, {
    ...options,
    headers
  })
}

export async function apiGet(url: string, currentUser?: UserData, user?: User): Promise<Response> {
  return apiRequest(url, { method: 'GET' }, currentUser, user)
}

export async function apiPost(url: string, data: any, currentUser?: UserData, user?: User): Promise<Response> {
  return apiRequest(url, {
    method: 'POST',
    body: JSON.stringify(data)
  }, currentUser, user)
}

export async function apiPut(url: string, data: any, currentUser?: UserData, user?: User): Promise<Response> {
  return apiRequest(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, currentUser, user)
}

export async function apiDelete(url: string, currentUser?: UserData, user?: User): Promise<Response> {
  return apiRequest(url, { method: 'DELETE' }, currentUser, user)
}