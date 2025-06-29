interface OfflineData {
  id: string
  type: string
  data: unknown
  timestamp: number
}

const OFFLINE_STORAGE_KEY = 'foaas_offline_queue'

export class OfflineStorage {
  static getQueue(): OfflineData[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(OFFLINE_STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  static addToQueue(type: string, data: unknown): void {
    if (typeof window === 'undefined') return
    
    const queue = this.getQueue()
    const item: OfflineData = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now()
    }
    
    queue.push(item)
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(queue))
  }

  static removeFromQueue(id: string): void {
    if (typeof window === 'undefined') return
    
    const queue = this.getQueue()
    const filtered = queue.filter(item => item.id !== id)
    localStorage.setItem(OFFLINE_STORAGE_KEY, JSON.stringify(filtered))
  }

  static clearQueue(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(OFFLINE_STORAGE_KEY)
  }
}