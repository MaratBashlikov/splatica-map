'use client'

import { Scene } from '@/types/scene'

interface SceneSidebarProps {
  scene: Scene | null
  onClose: () => void
  onOpenViewer?: (scene: Scene) => void
}

export default function SceneSidebar({ scene, onClose, onOpenViewer }: SceneSidebarProps) {
  if (!scene) return null

  const handleOpenViewer = () => {
    if (onOpenViewer) {
      onOpenViewer(scene)
    } else {
      window.open(scene.splaticaUrl, '_blank')
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed ${
          scene
            ? 'right-0 md:right-0 bottom-0 md:bottom-auto'
            : '-right-full md:-right-96'
        } top-0 md:top-0 w-full md:w-96 h-[60vh] md:h-full bg-gray-900/95 backdrop-blur-lg z-50 shadow-2xl transition-transform duration-300 ease-out flex flex-col`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-12">
          {/* Thumbnail */}
          {scene.thumbnailUrl && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img
                src={scene.thumbnailUrl}
                alt={scene.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2">{scene.title}</h2>

          {/* Description */}
          {scene.description && (
            <p className="text-gray-300 mb-4">{scene.description}</p>
          )}

          {/* Coordinates */}
          <div className="text-sm text-gray-400 mb-6">
            <p>
              Coordinates: {scene.lat.toFixed(4)}, {scene.lng.toFixed(4)}
            </p>
          </div>

          {/* Open button */}
          <button
            onClick={handleOpenViewer}
            className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Open in Viewer
          </button>
        </div>
      </div>
    </>
  )
}

