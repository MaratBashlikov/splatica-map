'use client'

import { Scene } from '@/types/scene'
import { useState, useEffect } from 'react'

interface SceneViewerModalProps {
  scene: Scene | null
  onClose: () => void
}

export default function SceneViewerModal({
  scene,
  onClose,
}: SceneViewerModalProps) {
  const [iframeError, setIframeError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (scene) {
      setIsVisible(true)
    }
  }, [scene])

  if (!scene) return null

  const handleIframeError = () => {
    setIframeError(true)
  }

  const openInNewTab = () => {
    window.open(scene.splaticaUrl, '_blank')
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  return (
    <div 
      className={`fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`relative w-full h-full max-w-7xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 border-4 border-white/20 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button - Scaniverse style */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-gray-700 hover:text-gray-900 transition-all duration-300 bg-white/95 hover:bg-white rounded-full p-2.5 shadow-xl backdrop-blur-sm border border-gray-200 hover:scale-110 hover:shadow-2xl"
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

        {/* Iframe or fallback - Scaniverse style */}
        {iframeError ? (
          <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center p-8">
              <p className="text-gray-700 mb-8 text-lg font-medium">Unable to load viewer in iframe</p>
              <button
                onClick={openInNewTab}
                className="px-10 py-5 bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 hover:from-cyan-300 hover:via-blue-400 hover:to-cyan-300 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 border border-white/20 hover:border-white/30 backdrop-blur-sm"
              >
                Open in Splatica
              </button>
            </div>
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

