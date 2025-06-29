'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, MapPin, Clock, CheckCircle } from 'lucide-react'
import { apiRequest } from '@/lib/api'
import { getCurrentLocation, calculateDistance } from '@/lib/location'
import { Store, StoreVisit } from '@/types/store'
import { Workflow } from '@/types/workflow'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [nearbyStore, setNearbyStore] = useState<Store | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [currentVisit, setCurrentVisit] = useState<StoreVisit | null>(null)
  const [loading, setLoading] = useState(true)

  const checkLocation = useCallback(async () => {
    try {
      const location = await getCurrentLocation()
      const storesData = await apiRequest<Store[]>('/api/stores/assigned')
      
      for (const store of storesData) {
        const distance = calculateDistance(location, {
          latitude: store.latitude,
          longitude: store.longitude
        })
        
        if (distance <= 50) {
          setNearbyStore(store)
          if (!selectedStore) {
            setSelectedStore(store)
            await loadWorkflows(store.id)
          }
          break
        }
      }
    } catch (error) {
      console.error('Location check failed:', error)
    }
  }, [selectedStore])

  const loadInitialData = async () => {
    try {
      const storesData = await apiRequest<Store[]>('/api/stores/assigned')
      setStores(storesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadWorkflows = async (storeId: string) => {
    try {
      const data = await apiRequest<Workflow[]>(`/api/stores/${storeId}/workflows`)
      setWorkflows(data)
    } catch (error) {
      console.error('Failed to load workflows:', error)
    }
  }

  useEffect(() => {
    loadInitialData()
    checkLocation()
  }, [checkLocation])

  const handleCheckIn = async () => {
    if (!selectedStore) return
    
    try {
      const location = await getCurrentLocation()
      const visit = await apiRequest<StoreVisit>('/api/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          storeId: selectedStore.id,
          location
        })
      })
      
      setCurrentVisit(visit)
      setIsCheckedIn(true)
    } catch (error) {
      console.error('Check-in failed:', error)
      alert('Failed to check in. Please try again.')
    }
  }

  const handleCheckOut = async () => {
    if (!currentVisit) return
    
    try {
      await apiRequest('/api/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({
          visitId: currentVisit.id
        })
      })
      
      setIsCheckedIn(false)
      setCurrentVisit(null)
      setSelectedStore(null)
      setWorkflows([])
    } catch (error) {
      console.error('Check-out failed:', error)
      alert('Failed to check out. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">FOAAS Worker</h1>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-6 space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-medium mb-2">Welcome, {user?.name}</h2>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        {nearbyStore && !selectedStore && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <MapPin className="h-5 w-5" />
              <span className="font-medium">Nearby Store Detected</span>
            </div>
            <p className="mt-1 text-sm text-blue-600">{nearbyStore.name}</p>
            <button
              onClick={() => {
                setSelectedStore(nearbyStore)
                loadWorkflows(nearbyStore.id)
              }}
              className="mt-2 text-sm text-blue-700 underline"
            >
              Select this store
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-medium mb-3">Select Store</h3>
          <select
            value={selectedStore?.id || ''}
            onChange={(e) => {
              const store = stores.find(s => s.id === e.target.value)
              if (store) {
                setSelectedStore(store)
                loadWorkflows(store.id)
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            disabled={isCheckedIn}
          >
            <option value="">Select a store</option>
            {stores.map(store => (
              <option key={store.id} value={store.id}>
                {store.name} - {store.address}
              </option>
            ))}
          </select>
        </div>

        {selectedStore && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Attendance</h3>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">
                  {isCheckedIn ? 'Checked In' : 'Not Checked In'}
                </span>
              </div>
            </div>
            
            {!isCheckedIn ? (
              <button
                onClick={handleCheckIn}
                className="w-full py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Check In
              </button>
            ) : (
              <button
                onClick={handleCheckOut}
                className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Check Out
              </button>
            )}
          </div>
        )}

        {isCheckedIn && workflows.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-medium mb-3">Today&apos;s Tasks</h3>
            <div className="space-y-2">
              {workflows.map(workflow => (
                <a
                  key={workflow.id}
                  href={`/workflow/${workflow.id}?storeId=${selectedStore?.id}`}
                  className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      {workflow.description && (
                        <p className="text-sm text-gray-600">{workflow.description}</p>
                      )}
                    </div>
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}