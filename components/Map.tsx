'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
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
  const onMarkerClickRef = useRef(onMarkerClick)
  const selectedMarkerIdRef = useRef(selectedMarkerId)
  
  // Keep refs updated
  useEffect(() => {
    onMarkerClickRef.current = onMarkerClick
    selectedMarkerIdRef.current = selectedMarkerId
  }, [onMarkerClick, selectedMarkerId])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY
    if (!mapboxToken) {
      console.error('MAPBOX_TOKEN is not set')
      return
    }
    if (!maptilerKey) {
      console.error('NEXT_PUBLIC_MAPTILER_KEY is not set')
      return
    }

    mapboxgl.accessToken = mapboxToken

    // Load MapTiler Dark Matter style and customize it
    const maptilerStyleUrl = `https://api.maptiler.com/maps/darkmatter/style.json?key=${maptilerKey}`
    
    fetch(maptilerStyleUrl)
      .then((res) => res.json())
      .then((style: any) => {
        // Customize the style for neon sci-fi aesthetic
        if (style.layers) {
          // Update background
          const bgLayer = (style.layers as any[]).find((l: any) => l.id === 'background')
          if (bgLayer) {
            bgLayer.paint = { 'background-color': '#020617' }
          }

          // Update water
          (style.layers as any[]).forEach((layer: any) => {
            if (layer.id && layer.id.includes('water') && layer.type === 'fill') {
              layer.paint = {
                ...layer.paint,
                'fill-color': '#020617',
                'fill-opacity': 0.8,
              }
            }
            // Update road colors for neon effect
            if (layer.id && layer.id.includes('road') && layer.type === 'line') {
              if (layer.id.includes('motorway')) {
                // Add glow layer for motorways
                const glowLayer = { ...layer }
                glowLayer.id = layer.id + '-glow'
                glowLayer.paint = {
                  ...layer.paint,
                  'line-color': '#22d3ee',
                  'line-width': (layer.paint?.['line-width'] as number) * 1.5 || 4,
                  'line-opacity': 0.4,
                  'line-blur': 3,
                }
                (style.layers as any[]).splice((style.layers as any[]).indexOf(layer) + 1, 0, glowLayer)
                layer.paint = {
                  ...layer.paint,
                  'line-color': '#06b6d4',
                  'line-opacity': 0.9,
                }
              } else if (layer.id.includes('primary') || layer.id.includes('trunk')) {
                const glowLayer = { ...layer }
                glowLayer.id = layer.id + '-glow'
                glowLayer.paint = {
                  ...layer.paint,
                  'line-color': '#38bdf8',
                  'line-width': (layer.paint?.['line-width'] as number) * 1.3 || 3,
                  'line-opacity': 0.3,
                  'line-blur': 2,
                }
                (style.layers as any[]).splice((style.layers as any[]).indexOf(layer) + 1, 0, glowLayer)
                layer.paint = {
                  ...layer.paint,
                  'line-color': '#0ea5e9',
                  'line-opacity': 0.8,
                }
              } else {
                layer.paint = {
                  ...layer.paint,
                  'line-color': '#1f2933',
                  'line-opacity': 0.25,
                }
              }
            }
            // Update text colors
            if (layer.type === 'symbol' && layer.layout?.['text-field']) {
              if (layer.id?.includes('city') || layer.id?.includes('place')) {
                layer.paint = {
                  ...layer.paint,
                  'text-color': layer.id?.includes('city-lg') ? '#e5e7eb' : '#94a3b8',
                  'text-halo-color': '#020617',
                  'text-halo-width': 2,
                }
              }
            }
          })

          // Add 3D buildings layer if building layer exists
          const buildingLayer = (style.layers as any[]).find(
            (l: any) => l.id === 'building' && l.type === 'fill'
          )
          if (buildingLayer && buildingLayer.source) {
            const building3dLayer = {
              id: '3d-buildings',
              type: 'fill-extrusion',
              source: buildingLayer.source,
              'source-layer': buildingLayer['source-layer'],
              minzoom: 14,
              paint: {
                'fill-extrusion-color': '#312e81',
                'fill-extrusion-opacity': 0.3,
                'fill-extrusion-height': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  14,
                  3,
                  16,
                  ['*', ['get', 'render_height'], 0.5],
                  20,
                  ['*', ['get', 'render_height'], 0.8],
                ],
                'fill-extrusion-base': [
                  'case',
                  ['>', ['get', 'render_min_height'], 0],
                  ['get', 'render_min_height'],
                  0,
                ],
              },
            }
            // Insert after building layer
            const buildingIndex = (style.layers as any[]).findIndex((l: any) => l.id === 'building')
            if (buildingIndex >= 0) {
              (style.layers as any[]).splice(buildingIndex + 1, 0, building3dLayer)
            }
          }
        }

        // Use customized dark neon style
        if (mapContainer.current) {
          map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: style,
            center: [0, 20],
            zoom: 2,
            pitch: 0,
            bearing: 0,
            // Removed projection: 'mercator' - it may cause marker positioning issues
          })

          setupMapControls()
          setupMapEvents()
        }
      })
      .catch((err) => {
        console.error('Failed to load MapTiler style:', err)
        // Fallback to default style
        if (mapContainer.current) {
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [0, 20],
      zoom: 2,
      pitch: 0,
      bearing: 0,
      // Removed projection: 'mercator' - it may cause marker positioning issues
          })
          setupMapControls()
          setupMapEvents()
        }
      })

    // Setup map controls and events
    function setupMapControls() {
      if (!map.current) return

      // Add navigation controls (zoom in/out)
      map.current.addControl(
        new mapboxgl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        'bottom-right'
      )

      // Add Reset View button
      const resetButton = document.createElement('button')
      resetButton.className =
        'mapboxgl-ctrl-icon mapboxgl-ctrl-reset-view'
      resetButton.type = 'button'
      resetButton.title = 'Reset View'
      resetButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 2L12 6H8L10 2Z" fill="currentColor"/>
          <path d="M10 18L8 14H12L10 18Z" fill="currentColor"/>
          <path d="M2 10L6 8V12L2 10Z" fill="currentColor"/>
          <path d="M18 10L14 12V8L18 10Z" fill="currentColor"/>
        </svg>
      `
      resetButton.style.cssText = `
        width: 30px;
        height: 30px;
        background: rgba(2, 6, 23, 0.8);
        border: 1px solid rgba(148, 163, 184, 0.3);
        border-radius: 4px;
        color: #94a3b8;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;
        backdrop-filter: blur(10px);
        transition: all 0.2s;
      `
      resetButton.addEventListener('mouseenter', () => {
        resetButton.style.background = 'rgba(2, 6, 23, 0.95)'
        resetButton.style.color = '#e5e7eb'
        resetButton.style.borderColor = 'rgba(148, 163, 184, 0.5)'
      })
      resetButton.addEventListener('mouseleave', () => {
        resetButton.style.background = 'rgba(2, 6, 23, 0.8)'
        resetButton.style.color = '#94a3b8'
        resetButton.style.borderColor = 'rgba(148, 163, 184, 0.3)'
      })
      resetButton.addEventListener('click', () => {
        if (map.current) {
          map.current.flyTo({
            center: [0, 20],
            zoom: 2,
            duration: 1500,
            essential: true,
          })
        }
      })

      // Wait for map to render, then add reset button
      map.current.on('load', () => {
        const controlsContainer = mapContainer.current?.querySelector(
          '.mapboxgl-ctrl-bottom-right'
        ) as HTMLElement | null
        if (controlsContainer) {
          controlsContainer.insertBefore(
            resetButton,
            controlsContainer.firstChild
          )
        }
      })
    }

    function setupMapEvents() {
      if (!map.current) return

      map.current.on('load', () => {
        // Wait a bit for map to fully render before marking as loaded
        setTimeout(() => {
      setIsLoaded(true)
        }, 100)
    })
    }

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])


  // Helper function to create individual marker
  const createIndividualMarker = useCallback((scene: Scene) => {
    // Create marker container - Neon sci-fi style vertical pillar
      const el = document.createElement('div')
    el.className = 'scene-marker group'
    el.style.display = 'flex'
    el.style.flexDirection = 'column'
    el.style.alignItems = 'center'
      el.style.cursor = 'pointer'
      el.style.position = 'relative'
    el.style.zIndex = '1'
    el.setAttribute('data-scene-id', scene.id)

    // Pulsing ring (hidden by default, shown when selected)
    const ring = document.createElement('div')
    ring.className = 'marker-ring'
    ring.style.position = 'absolute'
    ring.style.width = '32px'
    ring.style.height = '32px'
    ring.style.borderRadius = '50%'
    ring.style.border = '1px solid rgba(125, 211, 252, 0.4)'
    ring.style.filter = 'blur(1px)'
    ring.style.opacity = '0'
    ring.style.transform = 'scale(0.75)'
    ring.style.pointerEvents = 'none'
    ring.style.transition = 'all 0.3s ease-out'
    ring.style.bottom = '0'
    ring.style.left = '50%'
    ring.style.transform = 'translateX(-50%) scale(0.75)'

    // Vertical pillar only (no base circle)
    const pillar = document.createElement('div')
    pillar.className = 'marker-pillar'
    pillar.style.width = '6px'
    pillar.style.height = '40px'
    pillar.style.borderRadius = '50%'
    pillar.style.background = 'linear-gradient(to top, rgba(34, 211, 238, 1), rgba(125, 211, 252, 0.7), rgba(125, 211, 252, 0.1))'
    pillar.style.boxShadow = '0 0 18px rgba(34, 211, 238, 0.8)'
    pillar.style.transition = 'all 0.2s ease-out'
    pillar.style.position = 'relative'

    el.appendChild(ring)
    el.appendChild(pillar)

    // Add CSS animations if not already added
    if (!document.getElementById('marker-animations')) {
      const style = document.createElement('style')
      style.id = 'marker-animations'
      style.textContent = `
        @keyframes pillar-pulse {
          0%, 100% {
            opacity: 0.85;
            filter: brightness(1);
          }
          50% {
            opacity: 1;
            filter: brightness(1.15);
          }
        }
        @keyframes ring-pulse {
          0% {
            transform: scale(0.75);
            opacity: 0.4;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
        .scene-marker .marker-pillar {
          animation: pillar-pulse 3s ease-in-out infinite;
        }
        .scene-marker--selected .marker-ring {
          animation: ring-pulse 2.5s ease-out infinite;
          opacity: 0.4 !important;
        }
      `
      document.head.appendChild(style)
    }

    // Hover effects - increase height and glow
    el.addEventListener('mouseenter', () => {
      if (selectedMarkerIdRef.current !== scene.id) {
        pillar.style.height = '54px'
        pillar.style.boxShadow = '0 0 24px rgba(34, 211, 238, 1)'
      }
      el.style.zIndex = '1000'
    })

    el.addEventListener('mouseleave', () => {
      if (selectedMarkerIdRef.current !== scene.id) {
        pillar.style.height = '40px'
        pillar.style.boxShadow = '0 0 18px rgba(34, 211, 238, 0.8)'
      }
      el.style.zIndex = '1'
    })

    // Click handler - use ref to get latest callback
    el.addEventListener('click', () => {
      onMarkerClickRef.current(scene)
    })

    // Store references for later updates
    const markerData = {
      el,
      pillar,
      ring,
      sceneId: scene.id,
    }

    // Update selected state - use ref to get latest value
    const updateSelectedState = () => {
      if (selectedMarkerIdRef.current === scene.id) {
        el.classList.add('scene-marker--selected')
        ring.style.opacity = '0.4'
        ring.style.transform = 'translateX(-50%) scale(0.75)'
        pillar.style.boxShadow = '0 0 24px rgba(34, 211, 238, 1), 0 0 48px rgba(34, 211, 238, 0.6)'
      } else {
        el.classList.remove('scene-marker--selected')
        ring.style.opacity = '0'
        ring.style.transform = 'translateX(-50%) scale(0.75)'
        pillar.style.boxShadow = '0 0 18px rgba(34, 211, 238, 0.8)'
      }
    }

    updateSelectedState()

    // Store marker data for updates
    ;(el as any).markerData = markerData
    ;(el as any).updateSelectedState = updateSelectedState

    return el
  }, []) // No dependencies - use refs instead


  // Clean marker placement logic - rewritten from scratch
  useEffect(() => {
    console.log('[Map] Marker placement effect triggered', { 
      hasMap: !!map.current, 
      isLoaded, 
      scenesCount: scenes.length 
    })
    
    if (!map.current || !isLoaded) {
      console.log('[Map] Skipping marker creation:', { 
        hasMap: !!map.current, 
        isLoaded 
      })
      return
    }

    console.log('[Map] Creating markers for', scenes.length, 'scenes')

    // Helper function to parse and validate coordinates
    const parseCoordinates = (scene: Scene): [number, number] | null => {
      // Get raw values
      const rawLat = scene.lat
      const rawLng = scene.lng
      
      // Convert to numbers
      let lat: number
      let lng: number
      
      if (typeof rawLat === 'number') {
        lat = rawLat
      } else if (typeof rawLat === 'string') {
        lat = parseFloat(rawLat)
      } else {
        return null
      }
      
      if (typeof rawLng === 'number') {
        lng = rawLng
      } else if (typeof rawLng === 'string') {
        lng = parseFloat(rawLng)
      } else {
        return null
      }
      
      // Validate ranges
      // Latitude: -90 to 90
      // Longitude: -180 to 180
      if (isNaN(lat) || isNaN(lng)) {
        return null
      }
      
      // Check if coordinates are in valid ranges
      const latValid = lat >= -90 && lat <= 90
      const lngValid = lng >= -180 && lng <= 180
      
      // If both are valid, use them as-is
      if (latValid && lngValid) {
        return [lng, lat] // Mapbox format: [lng, lat]
      }
      
      // If lat is in lng range and lng is in lat range, they might be swapped
      const latInLngRange = lat >= -180 && lat <= 180 && Math.abs(lat) > 90
      const lngInLatRange = lng >= -90 && lng <= 90
      
      if (latInLngRange && lngInLatRange) {
        // Coordinates are swapped - swap them back
        console.warn(`Coordinates swapped for scene ${scene.id}:`, {
          original: { lat, lng },
          swapped: { lat: lng, lng: lat }
        })
        return [lat, lng] // Swap: use lat as lng, lng as lat
      }
      
      // Clamp to valid ranges as fallback
      lat = Math.max(-90, Math.min(90, lat))
      lng = Math.max(-180, Math.min(180, lng))
      
      return [lng, lat]
    }

    // Clear all existing markers
    console.log('[Map] Clearing', markersRef.current.length, 'existing markers')
    markersRef.current.forEach((marker) => {
      marker.remove()
    })
      markersRef.current = []

    // Create markers for each scene
    let createdCount = 0
    let skippedCount = 0
    
    scenes.forEach((scene, index) => {
      console.log(`[Map] Processing scene ${index + 1}/${scenes.length}:`, {
        id: scene.id,
        rawLat: scene.lat,
        rawLng: scene.lng,
        latType: typeof scene.lat,
        lngType: typeof scene.lng
      })
      
      const coords = parseCoordinates(scene)
      if (!coords) {
        console.warn(`[Map] Skipping scene ${scene.id}: invalid coordinates`, { lat: scene.lat, lng: scene.lng })
        skippedCount++
        return
      }

      const [lng, lat] = coords
      console.log(`[Map] Scene ${scene.id} coordinates:`, { lng, lat })

      // Create marker element
          const el = createIndividualMarker(scene)
      if (!el || !map.current) {
        console.warn(`[Map] Failed to create marker element for scene ${scene.id}`)
        skippedCount++
        return
      }
          
      // Create marker with bottom anchor
      // Bottom anchor means the bottom of the marker (pillar base) will be at the exact coordinates
          const marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
          })
            .setLngLat([lng, lat])
            .addTo(map.current)

      // Verify position
      const actualPos = marker.getLngLat()
      console.log(`[Map] Marker created for scene ${scene.id}:`, {
        requested: { lng, lat },
        actual: { lng: actualPos.lng, lat: actualPos.lat },
        diff: { lng: actualPos.lng - lng, lat: actualPos.lat - lat }
      })

      markersRef.current.push(marker)
      createdCount++
      })

    console.log(`[Map] Marker creation complete: ${createdCount} created, ${skippedCount} skipped`)

    // Cleanup function
    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
    }
  }, [scenes, isLoaded, createIndividualMarker])

  // Update all markers when selectedMarkerId changes
  useEffect(() => {
    if (!map.current || !isLoaded) return

    markersRef.current.forEach((marker) => {
      const el = marker.getElement()
      const updateSelectedState = (el as any).updateSelectedState
      if (updateSelectedState) {
        updateSelectedState() // This function uses selectedMarkerIdRef.current
      }
    })
  }, [selectedMarkerId, isLoaded])

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
      
      {/* Logo - Scaniverse style */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md rounded-lg px-4 py-3 shadow-xl">
          <h1 className="text-white text-xl font-semibold mb-0.5">Splatica World Map</h1>
          <p className="text-gray-300 text-xs">Scenes rendered by Splatica</p>
        </div>
      </div>

      {/* Map Controls - Scaniverse style */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
        <button
          onClick={handleZoomIn}
          className="w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-white/10 hover:border-white/20"
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-white/10 hover:border-white/20"
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
          </svg>
        </button>
      <button
          onClick={handleResetView}
          className="w-11 h-11 bg-black/50 hover:bg-black/70 backdrop-blur-md text-white rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-2xl border border-white/10 hover:border-white/20"
          aria-label="Reset view"
      >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
      </button>
      </div>
    </div>
  )
}

