import { Workflow } from './workflow'

export interface Store {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  createdAt: string
  updatedAt: string
}

export interface StoreVisitSchedule {
  id: string
  storeId: string
  dayOfWeek: number
  time: string
  workflowId: string
  workflow?: Workflow
}

export interface StoreVisit {
  id: string
  storeId: string
  workerId: string
  scheduledTime: string
  checkInTime?: string
  checkOutTime?: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed'
}