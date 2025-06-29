'use client'

import { useState } from 'react'
import { Task } from '@/types/workflow'
import { Check } from 'lucide-react'

interface CheckTaskProps {
  task: Task
  onComplete: (data: any) => void
  onSkip: () => void
}

interface CheckItem {
  id: string
  label: string
  required?: boolean
}

export default function CheckTask({ task, onComplete, onSkip }: CheckTaskProps) {
  const config = task.config || {}
  const items: CheckItem[] = config.items || []
  const [checkedItems, setCheckedItems] = useState<string[]>([])

  const handleToggle = (itemId: string) => {
    setCheckedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleComplete = () => {
    const requiredItems = items.filter(item => item.required)
    const allRequiredChecked = requiredItems.every(item => 
      checkedItems.includes(item.id)
    )

    if (!allRequiredChecked) {
      alert('Please complete all required items')
      return
    }

    onComplete({
      checkedItems,
      completedAt: new Date().toISOString()
    })
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">{task.name}</h2>
      {task.description && (
        <p className="text-gray-600 mb-4">{task.description}</p>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
          >
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={checkedItems.includes(item.id)}
                onChange={() => handleToggle(item.id)}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
                checkedItems.includes(item.id)
                  ? 'bg-black border-black'
                  : 'border-gray-300'
              }`}>
                {checkedItems.includes(item.id) && (
                  <Check className="h-3 w-3 text-white" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <span className="text-gray-900">
                {item.label}
                {item.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </span>
            </div>
          </label>
        ))}
      </div>

      {items.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No checklist items configured
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
          disabled={items.length === 0}
          className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Task
        </button>
      </div>
    </div>
  )
}