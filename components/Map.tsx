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
      // Validate coordinates first
      if (isNaN(scene.lat) || isNaN(scene.lng)) {
        console.error('Invalid coordinates for scene:', scene.id, scene.lat, scene.lng)
        return
      }

      // Ensure coordinates are within valid ranges
      const lat = Math.max(-90, Math.min(90, scene.lat))
      const lng = Math.max(-180, Math.min(180, scene.lng))

      // Create marker element - avoid position:relative as it can interfere with Mapbox positioning
      const el = document.createElement('div')
      el.style.width = '24px'
      el.style.height = '32px'
      el.style.cursor = 'pointer'
      el.style.zIndex = '1'
      // Don't use position:relative here - let Mapbox handle positioning

      // Create the circular marker
      const markerCircle = document.createElement('div')
      markerCircle.style.width = '24px'
      markerCircle.style.height = '24px'
      markerCircle.style.borderRadius = '50%'
      markerCircle.style.backgroundColor = '#6366f1'
      markerCircle.style.border = '3px solid #ffffff'
      markerCircle.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      markerCircle.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'
      markerCircle.style.marginBottom = '8px' // Space for stem
      markerCircle.style.display = 'block'
      markerCircle.style.marginLeft = 'auto'
      markerCircle.style.marginRight = 'auto'

      // Add "stem" effect
      const stem = document.createElement('div')
      stem.style.width = '2px'
      stem.style.height = '8px'
      stem.style.backgroundColor = '#6366f1'
      stem.style.marginLeft = 'auto'
      stem.style.marginRight = 'auto'
      stem.style.display = 'block'
      stem.style.pointerEvents = 'none'

      el.appendChild(markerCircle)
      el.appendChild(stem)

      // Hover effects
      el.addEventListener('mouseenter', () => {
        markerCircle.style.transform = 'scale(1.3)'
        markerCircle.style.boxShadow = '0 4px 16px rgba(99, 102, 241, 0.6)'
        el.style.zIndex = '1000'
      })

      el.addEventListener('mouseleave', () => {
        markerCircle.style.transform = 'scale(1)'
        markerCircle.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
        el.style.zIndex = '1'
      })

      // Add thumbnail if available
      if (scene.thumbnailUrl) {
        markerCircle.style.backgroundImage = `url(${scene.thumbnailUrl})`
        markerCircle.style.backgroundSize = 'cover'
        markerCircle.style.backgroundPosition = 'center'
      }

      // Use bottom anchor - this ensures the bottom of the element (where stem ends) is at coordinates
      // This is the most reliable method for positioning markers at all zoom levels
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .addTo(map.current!)

      el.addEventListener('click', () => {
        onMarkerClick(scene)
      })

      markersRef.current.push(marker)
    })
  }, [scenes, isLoaded, onMarkerClick])

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  )
}

