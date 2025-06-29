'use client'

import { useState, useEffect } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('PWA installed')
    }
    
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for 7 days
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString())
  }

  // Check if prompt was recently dismissed
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-prompt-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSince = (new Date().getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSince < 7) {
        setShowPrompt(false)
      }
    }
  }, [])

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-lg shadow-xl p-4 border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Install FOAAS Worker
            </h3>
            <p className="text-sm text-gray-600">
              Install our app for offline access and better performance
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleInstall}
            className="flex-1 bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Download className="h-4 w-4" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 border border-gray-300 py-2 px-4 rounded-md hover:bg-gray-50"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}