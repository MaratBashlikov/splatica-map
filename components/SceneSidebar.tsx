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
      {/* Backdrop - mobile only */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Sidebar / Bottom Sheet - Scaniverse style */}
      <div
        className={`fixed ${
          scene
            ? 'right-0 md:right-0 bottom-0 md:bottom-auto'
            : '-right-full md:-right-96 bottom-[-100%] md:bottom-auto'
        } top-auto md:top-0 w-full md:w-96 h-[70vh] md:h-full bg-black/80 backdrop-blur-2xl z-50 shadow-2xl transition-all duration-500 ease-out flex flex-col rounded-t-3xl md:rounded-none border-l border-white/10 md:border-l`}
      >
        {/* Close button - Scaniverse style */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition-all duration-300 z-10 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:scale-110"
        >
          <svg
            className="w-5 h-5"
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
            <div className="mb-6 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src={scene.thumbnailUrl}
                alt={scene.title}
                className="w-full h-56 object-cover"
              />
            </div>
          )}

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-3">{scene.title}</h2>

          {/* Description */}
          {scene.description && (
            <p className="text-gray-300 mb-6 leading-relaxed">{scene.description}</p>
          )}

          {/* Coordinates */}
          <div className="text-sm text-gray-400 mb-8 font-mono">
            <p>
              {scene.lat.toFixed(4)}, {scene.lng.toFixed(4)}
            </p>
          </div>

          {/* Open button with gradient - Scaniverse style */}
          <button
            onClick={handleOpenViewer}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 hover:from-cyan-300 hover:via-blue-400 hover:to-cyan-300 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] border border-white/20 hover:border-white/30 backdrop-blur-sm"
          >
            Open in Splatica Viewer
          </button>
        </div>
      </div>
    </>
  )
}

