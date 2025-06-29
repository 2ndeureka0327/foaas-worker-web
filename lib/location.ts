export interface Location {
  latitude: number
  longitude: number
  accuracy?: number
}

export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    )
  })
}

export function calculateDistance(
  loc1: Location,
  loc2: Location
): number {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (loc1.latitude * Math.PI) / 180
  const φ2 = (loc2.latitude * Math.PI) / 180
  const Δφ = ((loc2.latitude - loc1.latitude) * Math.PI) / 180
  const Δλ = ((loc2.longitude - loc1.longitude) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distance in meters
}