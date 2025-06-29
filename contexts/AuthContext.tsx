'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { User, AuthState, LoginCredentials } from '@/types/auth'
import { apiRequest } from '@/lib/api'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }))
      
      // 저장된 토큰 확인
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      if (token) {
        const userData = await apiRequest<User>('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    } catch (error) {
      console.error('Failed to check user:', error)
      // 토큰이 유효하지 않으면 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
      }
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      // Worker 계정은 백엔드 API를 통해 로그인
      const response = await apiRequest<{ 
        access_token: string; 
        refresh_token: string;
        user: User 
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      // 토큰을 localStorage에 저장 (오프라인 지원을 위해)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', response.access_token)
        localStorage.setItem('refresh_token', response.refresh_token)
      }

      setState({
        user: response.user,
        isLoading: false,
        isAuthenticated: true,
      })

      router.push('/')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
      
      if (token) {
        await apiRequest('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
      
      // 토큰 제거
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
      }
      
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      })
      
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      throw error
    }
  }

  const refreshUser = async () => {
    await checkUser()
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}