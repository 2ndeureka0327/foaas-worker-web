'use client'

import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { WifiOff } from 'lucide-react'

export default function NetworkStatus() {
  const isOnline = useNetworkStatus()

  return (
    <div className={`fixed bottom-4 left-4 z-50 transition-opacity ${
      isOnline ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className="bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <WifiOff className="h-5 w-5" />
        <span className="text-sm font-medium">Offline Mode</span>
      </div>
    </div>
  )
}