'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapPickerProps {
  initialLat?: number
  initialLng?: number
  onSelect: (lat: number, lng: number) => void
  onClose: () => void
}

export default function MapPicker({
  initialLat,
  initialLng,
  onSelect,
  onClose,
}: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number
    lng: number
  } | null>(
    initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
  )

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!mapboxToken) {
      console.error('MAPBOX_TOKEN is not set')
      return
    }

    mapboxgl.accessToken = mapboxToken

    const center: [number, number] =
      initialLat && initialLng ? [initialLng, initialLat] : [0, 20]

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center,
      zoom: initialLat && initialLng ? 10 : 2,
    })

    if (initialLat && initialLng) {
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = '#6366f1'
      el.style.border = '3px solid #ffffff'
      el.style.cursor = 'pointer'

      markerRef.current = new mapboxgl.Marker(el)
        .setLngLat([initialLng, initialLat])
        .addTo(map.current)
    }

    map.current.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setSelectedCoords({ lat, lng })

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat])
      } else {
        const el = document.createElement('div')
        el.className = 'custom-marker'
        el.style.width = '20px'
        el.style.height = '20px'
        el.style.borderRadius = '50%'
        el.style.backgroundColor = '#6366f1'
        el.style.border = '3px solid #ffffff'
        el.style.cursor = 'pointer'

        markerRef.current = new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current!)
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [initialLat, initialLng])

  const handleConfirm = () => {
    if (selectedCoords) {
      onSelect(selectedCoords.lat, selectedCoords.lng)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Pick Location on Map</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="flex-1 relative">
          <div ref={mapContainer} className="w-full h-full rounded-b-lg" />
        </div>
        <div className="p-4 border-t border-gray-700 flex justify-between items-center">
          {selectedCoords ? (
            <div className="text-white">
              Selected: {selectedCoords.lat.toFixed(6)},{' '}
              {selectedCoords.lng.toFixed(6)}
            </div>
          ) : (
            <div className="text-gray-400">Click on the map to select location</div>
          )}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedCoords}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

