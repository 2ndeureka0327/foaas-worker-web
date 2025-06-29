import { OfflineStorage } from './offline-storage'
import { apiRequest } from './api'

export class SyncService {
  private static syncInterval: NodeJS.Timeout | null = null
  private static isSyncing = false

  static start() {
    if (this.syncInterval) return
    
    // Sync every 30 seconds
    this.syncInterval = setInterval(() => {
      this.sync()
    }, 30000)
    
    // Initial sync
    this.sync()
    
    // Sync when coming online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.sync())
    }
  }

  static stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  static async sync() {
    if (this.isSyncing || !navigator.onLine) return
    
    this.isSyncing = true
    const queue = OfflineStorage.getQueue()
    
    for (const item of queue) {
      try {
        switch (item.type) {
          case 'photo_upload':
            await this.syncPhoto(item)
            break
          case 'workflow_log':
            await this.syncWorkflowLog(item)
            break
          case 'attendance':
            await this.syncAttendance(item)
            break
        }
        
        // Remove from queue after successful sync
        OfflineStorage.removeFromQueue(item.id)
      } catch (error) {
        console.error(`Failed to sync ${item.type}:`, error)
      }
    }
    
    this.isSyncing = false
  }

  private static async syncPhoto(item: any) {
    const { photo, type, taskId } = item.data
    
    // Convert base64 to blob
    const response = await fetch(photo)
    const blob = await response.blob()
    
    const formData = new FormData()
    formData.append('file', blob, `${type}-${Date.now()}.jpg`)
    formData.append('type', type)
    formData.append('taskId', taskId)

    await apiRequest('/api/photos/upload', {
      method: 'POST',
      body: formData,
      headers: {}
    })
  }

  private static async syncWorkflowLog(item: any) {
    await apiRequest('/api/workflow-logs', {
      method: 'POST',
      body: JSON.stringify(item.data)
    })
  }

  private static async syncAttendance(item: any) {
    const { type, ...data } = item.data
    const endpoint = type === 'check-in' 
      ? '/api/attendance/check-in' 
      : '/api/attendance/check-out'
    
    await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}