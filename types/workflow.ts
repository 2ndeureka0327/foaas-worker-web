export interface Workflow {
  id: string
  name: string
  description?: string
  tasks: Task[]
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  name: string
  description?: string
  type: 'photo' | 'text' | 'check' | 'select'
  order: number
  required: boolean
  config?: any
}

export interface WorkflowLog {
  id: string
  workflowId: string
  taskId: string
  workerId: string
  storeId: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  data?: any
  startedAt?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}