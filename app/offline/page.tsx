import { WifiOff } from 'lucide-react'

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <WifiOff className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          You're Offline
        </h1>
        <p className="text-gray-600 mb-6 max-w-md mx-auto px-4">
          You can still view cached content and complete tasks. 
          Your data will sync when you're back online.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}