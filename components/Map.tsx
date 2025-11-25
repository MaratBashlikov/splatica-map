'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Scene } from '@/types/scene'

interface MapProps {
  scenes: Scene[]
  onMarkerClick: (scene: Scene) => void
  selectedMarkerId?: string | null
}

export default function Map({ scenes, onMarkerClick, selectedMarkerId }: MapProps) {
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

    // Use dark style and customize it after load
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      pitch: 0,
      bearing: 0,
    })

    map.current.on('load', () => {
      // Customize the dark style to be even darker and more minimal
      if (map.current) {
        // Darken background
        if (map.current.getLayer('background')) {
          map.current.setPaintProperty('background', 'background-color', '#0a0a0a')
        }

        // Darken water
        if (map.current.getLayer('water')) {
          map.current.setPaintProperty('water', 'fill-color', '#1a1a1a')
        }

        // Make roads more subtle
        const roadLayers = [
          'road-street',
          'road-primary',
          'road-secondary',
          'road-motorway',
          'road-trunk',
        ]
        roadLayers.forEach((layerId) => {
          if (map.current?.getLayer(layerId)) {
            map.current.setPaintProperty(layerId, 'line-opacity', 0.3)
            map.current.setPaintProperty(layerId, 'line-color', '#2a2a2a')
          }
        })

        // Make city labels more subtle
        if (map.current.getLayer('place-city-lg-n')) {
          map.current.setPaintProperty('place-city-lg-n', 'text-color', '#6b8db8')
          map.current.setPaintProperty('place-city-lg-n', 'text-halo-color', '#0a0a0a')
        }
        if (map.current.getLayer('place-city-md-n')) {
          map.current.setPaintProperty('place-city-md-n', 'text-color', '#6b8db8')
          map.current.setPaintProperty('place-city-md-n', 'text-halo-color', '#0a0a0a')
        }
      }
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

    // Create custom markers for each scene - vertical glowing pillars
    scenes.forEach((scene) => {
      // Validate coordinates first
      if (isNaN(scene.lat) || isNaN(scene.lng)) {
        console.error('Invalid coordinates for scene:', scene.id, scene.lat, scene.lng)
        return
      }

      // Ensure coordinates are within valid ranges
      const lat = Math.max(-90, Math.min(90, scene.lat))
      const lng = Math.max(-180, Math.min(180, scene.lng))

      // Create marker container
      const el = document.createElement('div')
      el.className = 'marker-container'
      el.style.width = '12px'
      el.style.height = '50px'
      el.style.cursor = 'pointer'
      el.style.position = 'relative'
      el.style.display = 'flex'
      el.style.flexDirection = 'column'
      el.style.alignItems = 'center'
      el.style.justifyContent = 'flex-end'
      el.style.zIndex = '1'
      el.setAttribute('data-scene-id', scene.id)

      // Base circle (footprint)
      const base = document.createElement('div')
      base.style.width = '12px'
      base.style.height = '12px'
      base.style.borderRadius = '50%'
      base.style.backgroundColor = 'rgba(100, 200, 255, 0.3)'
      base.style.boxShadow = '0 0 8px rgba(100, 200, 255, 0.5)'
      base.style.position = 'absolute'
      base.style.bottom = '0'
      base.style.left = '50%'
      base.style.transform = 'translateX(-50%)'
      base.style.transition = 'all 0.3s ease'
      base.style.pointerEvents = 'none'

      // Vertical pillar with gradient - wider at bottom, narrower at top
      const pillar = document.createElement('div')
      pillar.className = 'marker-pillar'
      pillar.style.width = '6px'
      pillar.style.height = '50px'
      // Gradient from bright cyan-blue at bottom to transparent at top
      pillar.style.background = 'linear-gradient(to top, rgba(100, 200, 255, 0.95) 0%, rgba(100, 200, 255, 0.7) 50%, rgba(100, 200, 255, 0.2) 100%)'
      // Tapered shape using border-radius
      pillar.style.borderRadius = '3px 3px 1px 1px'
      pillar.style.boxShadow = '0 0 12px rgba(100, 200, 255, 0.6), inset 0 0 8px rgba(150, 220, 255, 0.4)'
      pillar.style.position = 'relative'
      pillar.style.transition = 'all 0.3s ease'
      pillar.style.animation = 'pulse 2s ease-in-out infinite'
      pillar.style.pointerEvents = 'none'

      // Add CSS animation for pulsing
      if (!document.getElementById('marker-animations')) {
        const style = document.createElement('style')
        style.id = 'marker-animations'
        style.textContent = `
          @keyframes pulse {
            0%, 100% {
              opacity: 0.8;
              transform: scaleY(1);
            }
            50% {
              opacity: 1;
              transform: scaleY(1.05);
            }
          }
          @keyframes ring-pulse {
            0% {
              transform: translateX(-50%) scale(1);
              opacity: 0.6;
            }
            100% {
              transform: translateX(-50%) scale(2);
              opacity: 0;
            }
          }
          .marker-container.selected .marker-ring {
            animation: ring-pulse 2s ease-out infinite;
          }
        `
        document.head.appendChild(style)
      }

      // Pulsing ring for selected marker
      const ring = document.createElement('div')
      ring.className = 'marker-ring'
      ring.style.width = '20px'
      ring.style.height = '20px'
      ring.style.borderRadius = '50%'
      ring.style.border = '2px solid rgba(100, 200, 255, 0.6)'
      ring.style.position = 'absolute'
      ring.style.bottom = '-4px'
      ring.style.left = '50%'
      ring.style.transform = 'translateX(-50%)'
      ring.style.pointerEvents = 'none'
      ring.style.opacity = '0'

      el.appendChild(pillar)
      el.appendChild(base)
      el.appendChild(ring)

      // Hover effects
      el.addEventListener('mouseenter', () => {
        if (selectedMarkerId !== scene.id) {
          pillar.style.width = '8px'
          pillar.style.height = '60px'
          pillar.style.boxShadow = '0 0 20px rgba(100, 200, 255, 0.8), inset 0 0 12px rgba(150, 220, 255, 0.6)'
          base.style.width = '16px'
          base.style.height = '16px'
          base.style.boxShadow = '0 0 12px rgba(100, 200, 255, 0.7)'
        }
        el.style.zIndex = '1000'
      })

      el.addEventListener('mouseleave', () => {
        if (selectedMarkerId !== scene.id) {
          pillar.style.width = '6px'
          pillar.style.height = '50px'
          pillar.style.boxShadow = '0 0 12px rgba(100, 200, 255, 0.6), inset 0 0 8px rgba(150, 220, 255, 0.4)'
          base.style.width = '12px'
          base.style.height = '12px'
          base.style.boxShadow = '0 0 8px rgba(100, 200, 255, 0.5)'
        }
        el.style.zIndex = '1'
      })

      // Click handler
      el.addEventListener('click', () => {
        onMarkerClick(scene)
      })

      // Store references for later updates
      const markerData = {
        el,
        pillar,
        base,
        ring,
        sceneId: scene.id,
      }

      // Update selected state
      const updateSelectedState = () => {
        if (selectedMarkerId === scene.id) {
          el.classList.add('selected')
          ring.style.opacity = '0.6'
          pillar.style.width = '8px'
          pillar.style.height = '60px'
          pillar.style.boxShadow = '0 0 20px rgba(100, 200, 255, 0.8), inset 0 0 12px rgba(150, 220, 255, 0.6)'
          base.style.width = '16px'
          base.style.height = '16px'
          base.style.boxShadow = '0 0 12px rgba(100, 200, 255, 0.7)'
        } else {
          el.classList.remove('selected')
          ring.style.opacity = '0'
          pillar.style.width = '6px'
          pillar.style.height = '50px'
          pillar.style.boxShadow = '0 0 12px rgba(100, 200, 255, 0.6), inset 0 0 8px rgba(150, 220, 255, 0.4)'
          base.style.width = '12px'
          base.style.height = '12px'
          base.style.boxShadow = '0 0 8px rgba(100, 200, 255, 0.5)'
        }
      }

      updateSelectedState()

      // Store marker data for updates
      ;(el as any).markerData = markerData

      // Create marker with bottom anchor
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat([lng, lat])
        .addTo(map.current!)

      markersRef.current.push(marker)
    })

    // Update all markers when selectedMarkerId changes
    markersRef.current.forEach((marker) => {
      const el = marker.getElement()
      const markerData = (el as any).markerData
      if (markerData) {
        if (selectedMarkerId === markerData.sceneId) {
          markerData.el.classList.add('selected')
          markerData.ring.style.opacity = '0.6'
          markerData.pillar.style.width = '8px'
          markerData.pillar.style.height = '60px'
          markerData.pillar.style.boxShadow = '0 0 20px rgba(100, 200, 255, 0.8), inset 0 0 12px rgba(150, 220, 255, 0.6)'
          markerData.base.style.width = '16px'
          markerData.base.style.height = '16px'
          markerData.base.style.boxShadow = '0 0 12px rgba(100, 200, 255, 0.7)'
        } else {
          markerData.el.classList.remove('selected')
          markerData.ring.style.opacity = '0'
          markerData.pillar.style.width = '6px'
          markerData.pillar.style.height = '50px'
          markerData.pillar.style.boxShadow = '0 0 12px rgba(100, 200, 255, 0.6), inset 0 0 8px rgba(150, 220, 255, 0.4)'
          markerData.base.style.width = '12px'
          markerData.base.style.height = '12px'
          markerData.base.style.boxShadow = '0 0 8px rgba(100, 200, 255, 0.5)'
        }
      }
    })
  }, [scenes, isLoaded, onMarkerClick, selectedMarkerId])

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn({ duration: 300 })
    }
  }

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut({ duration: 300 })
    }
  }

  const handleResetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [0, 20],
        zoom: 2,
        duration: 1000,
        easing: (t) => t * (2 - t), // ease-out
      })
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Logo */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1 className="text-white text-xl font-semibold mb-1">Splatica World Map</h1>
        <p className="text-gray-400 text-xs">Scenes rendered by Splatica</p>
      </div>

      {/* Map Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-10 h-10 bg-gray-900/80 hover:bg-gray-800/90 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-10 h-10 bg-gray-900/80 hover:bg-gray-800/90 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={handleResetView}
          className="w-10 h-10 bg-gray-900/80 hover:bg-gray-800/90 backdrop-blur-sm text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
          aria-label="Reset view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  )
}

