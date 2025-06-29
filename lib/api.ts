const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface ApiOptions extends RequestInit {
  token?: string
}

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options
  
  const headers: HeadersInit = {
    ...fetchOptions.headers,
  }
  
  // Content-Type 헤더는 FormData가 아닌 경우에만 설정
  if (!(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  
  // 토큰이 명시적으로 제공되지 않았다면 localStorage에서 가져오기
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null)
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `API Error: ${response.status}`)
  }
  
  return response.json()
}