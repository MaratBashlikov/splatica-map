'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Scene } from '@/types/scene'

interface MapProps {
  scenes: Scene[]
  onMarkerClick: (scene: Scene) => void
}

export default function Map({ scenes, onMarkerClick }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!mapboxToken) {
      console.error('MAPBOX_TOKEN is not set')
      return
    }

    mapboxgl.accessToken = mapboxToken

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      pitch: 0,
      bearing: 0,
    })

    map.current.on('load', () => {
      setIsLoaded(true)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!map.current || !isLoaded) return

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = []

    // Create custom markers for each scene
    scenes.forEach((scene) => {
      // Outer container - this is what Mapbox positions
      const container = document.createElement('div')
      container.style.position = 'relative'
      container.style.width = '24px'
      container.style.height = '32px'
      container.style.cursor = 'pointer'
      container.style.display = 'flex'
      container.style.alignItems = 'flex-end'
      container.style.justifyContent = 'center'

      // Inner marker element - this can be transformed without affecting position
      const el = document.createElement('div')
      el.className = 'custom-marker'
      el.style.width = '24px'
      el.style.height = '24px'
      el.style.borderRadius = '50%'
      el.style.backgroundColor = '#6366f1'
      el.style.border = '3px solid #ffffff'
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      el.style.transition = 'all 0.2s ease'
      el.style.transformOrigin = 'center bottom'
      el.style.flexShrink = '0'

      // Add "stem" effect
      const stem = document.createElement('div')
      stem.style.position = 'absolute'
      stem.style.bottom = '0'
      stem.style.left = '50%'
      stem.style.transform = 'translateX(-50%)'
      stem.style.width = '2px'
      stem.style.height = '8px'
      stem.style.backgroundColor = '#6366f1'
      stem.style.pointerEvents = 'none'
      container.appendChild(stem)

      container.appendChild(el)

      // Hover effects - transform only the inner element
      container.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.3)'
        el.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.6)'
        container.style.zIndex = '1000'
      })

      container.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)'
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        container.style.zIndex = '1'
      })

      // Add thumbnail if available
      if (scene.thumbnailUrl) {
        el.style.backgroundImage = `url(${scene.thumbnailUrl})`
        el.style.backgroundSize = 'cover'
        el.style.backgroundPosition = 'center'
      }

      // Create marker with anchor at bottom center to keep it pinned to coordinates
      const marker = new mapboxgl.Marker({
        element: container,
        anchor: 'bottom',
      })
        .setLngLat([scene.lng, scene.lat])
        .addTo(map.current!)

      container.addEventListener('click', () => {
        onMarkerClick(scene)
      })

      markersRef.current.push(marker)
    })
  }, [scenes, isLoaded, onMarkerClick])

  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [0, 20],
        zoom: 2,
        duration: 1000,
      })
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      <button
        onClick={resetView}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-gray-900/80 hover:bg-gray-800/90 text-white rounded-lg shadow-lg backdrop-blur-sm transition-colors"
      >
        Reset View
      </button>
    </div>
  )
}

