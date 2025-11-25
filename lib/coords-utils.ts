/**
 * Parse coordinates from Google Maps URL
 * Supports various Google Maps URL formats
 */
export function parseGoogleMapsUrl(url: string): { lat: number; lng: number } | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    // Format 1: https://www.google.com/maps?q=lat,lng
    const qMatch = url.match(/[?&]q=([^&]+)/)
    if (qMatch) {
      const coords = qMatch[1].split(',')
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0].trim())
        const lng = parseFloat(coords[1].trim())
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng }
        }
      }
    }

    // Format 2: https://www.google.com/maps/@lat,lng,zoom
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (atMatch) {
      const lat = parseFloat(atMatch[1])
      const lng = parseFloat(atMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng }
      }
    }

    // Format 3: https://maps.google.com/?q=lat,lng
    const mapsQMatch = url.match(/maps\.google\.com\/\?q=([^&]+)/)
    if (mapsQMatch) {
      const coords = mapsQMatch[1].split(',')
      if (coords.length >= 2) {
        const lat = parseFloat(coords[0].trim())
        const lng = parseFloat(coords[1].trim())
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng }
        }
      }
    }

    // Format 4: https://www.google.com/maps/place/.../@lat,lng,zoom
    const placeMatch = url.match(/\/place\/[^@]+@(-?\d+\.?\d*),(-?\d+\.?\d*)/)
    if (placeMatch) {
      const lat = parseFloat(placeMatch[1])
      const lng = parseFloat(placeMatch[2])
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng }
      }
    }

    return null
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error)
    return null
  }
}

/**
 * Check if string is a Google Maps URL
 */
export function isGoogleMapsUrl(str: string): boolean {
  return /(maps\.google\.|google\.com\/maps)/i.test(str)
}

