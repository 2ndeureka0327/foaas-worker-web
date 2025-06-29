'use client'

import { useEffect } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { SyncService } from '@/lib/sync-service'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Start sync service
    SyncService.start()
    
    return () => {
      SyncService.stop()
    }
  }, [])
  
  return <AuthProvider>{children}</AuthProvider>
}