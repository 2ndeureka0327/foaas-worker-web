'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { apiRequest } from '@/lib/api'
import { Workflow, Task, WorkflowLog } from '@/types/workflow'
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react'
import PhotoTask from '@/components/tasks/PhotoTask'
import TextTask from '@/components/tasks/TextTask'
import CheckTask from '@/components/tasks/CheckTask'
import SelectTask from '@/components/tasks/SelectTask'

export default function WorkflowPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const workflowId = params.id as string
  const storeId = searchParams.get('storeId')
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0)
  const [workflowLogs, setWorkflowLogs] = useState<WorkflowLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkflow()
  }, [workflowId])

  const loadWorkflow = async () => {
    try {
      const data = await apiRequest<Workflow>(`/api/workflows/${workflowId}`)
      setWorkflow(data)
      
      // Initialize workflow logs for each task
      const logs: WorkflowLog[] = data.tasks.map(task => ({
        id: `temp-${task.id}`,
        workflowId: workflowId,
        taskId: task.id,
        workerId: '', // Will be set from auth context
        storeId: storeId || '',
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      setWorkflowLogs(logs)
    } catch (error) {
      console.error('Failed to load workflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskComplete = async (taskId: string, data: any) => {
    try {
      // Create or update workflow log
      const log = await apiRequest<WorkflowLog>('/api/workflow-logs', {
        method: 'POST',
        body: JSON.stringify({
          workflowId,
          taskId,
          storeId,
          status: 'completed',
          data
        })
      })

      // Update local state
      setWorkflowLogs(prev => 
        prev.map(l => l.taskId === taskId ? { ...l, ...log } : l)
      )

      // Move to next task
      if (currentTaskIndex < (workflow?.tasks.length || 0) - 1) {
        setCurrentTaskIndex(prev => prev + 1)
      } else {
        // All tasks completed
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to save task:', error)
      alert('Failed to save task. Please try again.')
    }
  }

  const handleTaskSkip = async (taskId: string) => {
    try {
      const log = await apiRequest<WorkflowLog>('/api/workflow-logs', {
        method: 'POST',
        body: JSON.stringify({
          workflowId,
          taskId,
          storeId,
          status: 'skipped'
        })
      })

      setWorkflowLogs(prev => 
        prev.map(l => l.taskId === taskId ? { ...l, ...log } : l)
      )

      if (currentTaskIndex < (workflow?.tasks.length || 0) - 1) {
        setCurrentTaskIndex(prev => prev + 1)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to skip task:', error)
    }
  }

  if (loading || !workflow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading workflow...</p>
      </div>
    )
  }

  const currentTask = workflow.tasks[currentTaskIndex]
  const currentLog = workflowLogs.find(l => l.taskId === currentTask.id)

  const renderTask = () => {
    switch (currentTask.type) {
      case 'photo':
        return (
          <PhotoTask
            task={currentTask}
            onComplete={(data) => handleTaskComplete(currentTask.id, data)}
            onSkip={() => handleTaskSkip(currentTask.id)}
          />
        )
      case 'text':
        return (
          <TextTask
            task={currentTask}
            onComplete={(data) => handleTaskComplete(currentTask.id, data)}
            onSkip={() => handleTaskSkip(currentTask.id)}
          />
        )
      case 'check':
        return (
          <CheckTask
            task={currentTask}
            onComplete={(data) => handleTaskComplete(currentTask.id, data)}
            onSkip={() => handleTaskSkip(currentTask.id)}
          />
        )
      case 'select':
        return (
          <SelectTask
            task={currentTask}
            onComplete={(data) => handleTaskComplete(currentTask.id, data)}
            onSkip={() => handleTaskSkip(currentTask.id)}
          />
        )
      default:
        return <div>Unknown task type</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold">{workflow.name}</h1>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Progress indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Task {currentTaskIndex + 1} of {workflow.tasks.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(((currentTaskIndex + 1) / workflow.tasks.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentTaskIndex + 1) / workflow.tasks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Task list */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <h3 className="font-medium mb-3">Tasks</h3>
          <div className="space-y-2">
            {workflow.tasks.map((task, index) => {
              const log = workflowLogs.find(l => l.taskId === task.id)
              const isCompleted = log?.status === 'completed'
              const isCurrent = index === currentTaskIndex
              const isSkipped = log?.status === 'skipped'
              
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-2 rounded-md ${
                    isCurrent ? 'bg-gray-100' : ''
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : isSkipped ? (
                    <Circle className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                  <span className={`text-sm ${
                    isCompleted ? 'text-green-600' : 
                    isSkipped ? 'text-gray-400' :
                    isCurrent ? 'font-medium' : 'text-gray-600'
                  }`}>
                    {task.name}
                    {task.required && !isCompleted && !isSkipped && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current task */}
        <div className="bg-white rounded-lg shadow">
          {renderTask()}
        </div>
      </div>
    </div>
  )
}