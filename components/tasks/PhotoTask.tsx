'use client'

import { useState, useRef } from 'react'
import { Camera, Upload, X } from 'lucide-react'
import { Task } from '@/types/workflow'
import { apiRequest } from '@/lib/api'
import { OfflineStorage } from '@/lib/offline-storage'

interface PhotoTaskData {
  beforePhoto: string
  afterPhoto: string
  timestamp: string
}

interface PhotoTaskProps {
  task: Task
  onComplete: (data: PhotoTaskData) => void
  onSkip: () => void
}

export default function PhotoTask({ task, onComplete, onSkip }: PhotoTaskProps) {
  const [beforePhoto, setBeforePhoto] = useState<string | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [captureMode, setCaptureMode] = useState<'before' | 'after'>('before')

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      if (captureMode === 'before') {
        setBeforePhoto(base64)
      } else {
        setAfterPhoto(base64)
      }
    }
    reader.readAsDataURL(file)
  }

  const uploadPhoto = async (photo: string, type: 'before' | 'after') => {
    try {
      // Convert base64 to blob
      const response = await fetch(photo)
      const blob = await response.blob()
      
      const formData = new FormData()
      formData.append('file', blob, `${type}-${Date.now()}.jpg`)
      formData.append('type', type)
      formData.append('taskId', task.id)

      const result = await apiRequest('/api/photos/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it with boundary
        }
      })

      return result.url
    } catch (error) {
      console.error('Photo upload failed:', error)
      // Store for offline sync
      OfflineStorage.addToQueue('photo_upload', {
        photo,
        type,
        taskId: task.id
      })
      return photo // Return base64 for now
    }
  }

  const handleComplete = async () => {
    if (!beforePhoto || !afterPhoto) {
      alert('Please capture both before and after photos')
      return
    }

    setUploading(true)
    try {
      const [beforeUrl, afterUrl] = await Promise.all([
        uploadPhoto(beforePhoto, 'before'),
        uploadPhoto(afterPhoto, 'after')
      ])

      onComplete({
        beforePhoto: beforeUrl,
        afterPhoto: afterUrl,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to complete task:', error)
      alert('Failed to upload photos. They will be synced when online.')
    } finally {
      setUploading(false)
    }
  }

  const openCamera = (mode: 'before' | 'after') => {
    setCaptureMode(mode)
    fileInputRef.current?.click()
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">{task.name}</h2>
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileCapture}
        className="hidden"
      />

      <div className="space-y-4">
        {/* Before Photo */}
        <div>
          <h3 className="font-medium mb-2">Before Photo</h3>
          {beforePhoto ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={beforePhoto}
                alt="Before"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => setBeforePhoto(null)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openCamera('before')}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
            >
              <Camera className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">Tap to capture</span>
            </button>
          )}
        </div>

        {/* After Photo */}
        <div>
          <h3 className="font-medium mb-2">After Photo</h3>
          {afterPhoto ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={afterPhoto}
                alt="After"
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => setAfterPhoto(null)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openCamera('after')}
              className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-gray-50"
            >
              <Camera className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-500">Tap to capture</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {!task.required && (
          <button
            onClick={onSkip}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Skip
          </button>
        )}
        <button
          onClick={handleComplete}
          disabled={!beforePhoto || !afterPhoto || uploading}
          className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center gap-2">
              <Upload className="h-4 w-4 animate-pulse" />
              Uploading...
            </span>
          ) : (
            'Complete Task'
          )}
        </button>
      </div>
    </div>
  )
}