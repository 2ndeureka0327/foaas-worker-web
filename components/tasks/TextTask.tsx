'use client'

import { useState } from 'react'
import { Task } from '@/types/workflow'

interface TextTaskProps {
  task: Task
  onComplete: (data: any) => void
  onSkip: () => void
}

export default function TextTask({ task, onComplete, onSkip }: TextTaskProps) {
  const [text, setText] = useState('')
  const config = task.config || {}
  const minLength = config.minLength || 0
  const maxLength = config.maxLength || 500

  const handleComplete = () => {
    if (text.trim().length < minLength) {
      alert(`Please enter at least ${minLength} characters`)
      return
    }
    
    onComplete({
      text: text.trim(),
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">{task.name}</h2>
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.label || 'Enter your response'}
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={config.placeholder || 'Type here...'}
            rows={config.rows || 4}
            maxLength={maxLength}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
          />
          <div className="mt-1 flex justify-between text-sm text-gray-500">
            <span>
              {minLength > 0 && `Min: ${minLength} characters`}
            </span>
            <span>
              {text.length}/{maxLength}
            </span>
          </div>
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
          disabled={text.trim().length < minLength}
          className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Task
        </button>
      </div>
    </div>
  )
}