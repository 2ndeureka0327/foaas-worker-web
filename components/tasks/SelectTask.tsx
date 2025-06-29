'use client'

import { useState } from 'react'
import { Task } from '@/types/workflow'

interface SelectTaskData {
  selectedValues: string[]
  timestamp: string
}

interface SelectTaskProps {
  task: Task
  onComplete: (data: SelectTaskData) => void
  onSkip: () => void
}

interface SelectOption {
  id: string
  label: string
  value: string
}

export default function SelectTask({ task, onComplete, onSkip }: SelectTaskProps) {
  const config = task.config || {}
  const options: SelectOption[] = config.options || []
  const allowMultiple = config.allowMultiple || false
  const [selectedValues, setSelectedValues] = useState<string[]>([])

  const handleSelect = (value: string) => {
    if (allowMultiple) {
      setSelectedValues(prev =>
        prev.includes(value)
          ? prev.filter(v => v !== value)
          : [...prev, value]
      )
    } else {
      setSelectedValues([value])
    }
  }

  const handleComplete = () => {
    if (selectedValues.length === 0) {
      alert('Please select at least one option')
      return
    }

    onComplete({
      selectedValues,
      timestamp: new Date().toISOString()
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">{task.name}</h2>
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}

      {allowMultiple && (
        <p className="text-sm text-gray-500 mb-4">
          Select all that apply
        </p>
      )}

      <div className="space-y-2">
        {options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.value)}
            className={`w-full p-3 text-left border rounded-lg transition-colors ${
              selectedValues.includes(option.value)
                ? 'border-black bg-gray-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={selectedValues.includes(option.value) ? 'font-medium' : ''}>
                {option.label}
              </span>
              {selectedValues.includes(option.value) && (
                <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {options.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No options configured
        </p>
      )}

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
          disabled={selectedValues.length === 0}
          className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Task
        </button>
      </div>
    </div>
  )
}