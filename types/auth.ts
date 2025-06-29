export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'worker'
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}