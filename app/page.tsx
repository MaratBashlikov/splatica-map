'use client'

import { useState } from 'react'
import Map from '@/components/Map'
import SceneSidebar from '@/components/SceneSidebar'
import SceneViewerModal from '@/components/SceneViewerModal'
import { useScenes } from '@/hooks/useScenes'
import { Scene } from '@/types/scene'

export default function Home() {
  const { scenes, loading, error } = useScenes()
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const [viewerScene, setViewerScene] = useState<Scene | null>(null)

  const handleMarkerClick = (scene: Scene) => {
    // Open viewer directly when clicking on marker
    setViewerScene(scene)
    setSelectedScene(null)
  }

  const handleOpenViewer = (scene: Scene) => {
    setViewerScene(scene)
    setSelectedScene(null)
  }

  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      {loading ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-white">Loading map...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-full">
          <div className="text-red-400">Error: {error}</div>
        </div>
      ) : scenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center w-full h-full text-white">
          <p className="text-xl mb-4">No scenes added yet</p>
        </div>
      ) : (
        <>
          <Map scenes={scenes} onMarkerClick={handleMarkerClick} />
          <SceneSidebar
            scene={selectedScene}
            onClose={() => setSelectedScene(null)}
            onOpenViewer={handleOpenViewer}
          />
          {selectedScene && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30 md:hidden">
              <button
                onClick={() => handleOpenViewer(selectedScene)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-lg transition-colors"
              >
                Open Viewer
              </button>
            </div>
          )}
        </>
      )}

      {viewerScene && (
        <SceneViewerModal
          scene={viewerScene}
          onClose={() => setViewerScene(null)}
        />
      )}
    </main>
  )
}

