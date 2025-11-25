'use client'

import { Scene } from '@/types/scene'
import { useState } from 'react'

interface SceneViewerModalProps {
  scene: Scene | null
  onClose: () => void
}

export default function SceneViewerModal({
  scene,
  onClose,
}: SceneViewerModalProps) {
  const [iframeError, setIframeError] = useState(false)

  if (!scene) return null

  const handleIframeError = () => {
    setIframeError(true)
  }

  const openInNewTab = () => {
    window.open(scene.splaticaUrl, '_blank')
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
      <div className="relative w-full h-full max-w-7xl max-h-[90vh] bg-gray-900 rounded-lg overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-gray-900/80 rounded-full p-2"
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

        {/* Iframe or fallback */}
        {iframeError ? (
          <div className="flex flex-col items-center justify-center h-full text-white">
            <p className="mb-4">Unable to load viewer in iframe</p>
            <button
              onClick={openInNewTab}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition-colors"
            >
              Open in New Tab
            </button>
          </div>
        ) : (
          <iframe
            src={scene.splaticaUrl}
            className="w-full h-full border-0"
            onError={handleIframeError}
            title={scene.title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
    </div>
  )
}

