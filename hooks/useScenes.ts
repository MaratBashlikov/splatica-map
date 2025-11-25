'use client'

import { useState, useEffect } from 'react'
import { Scene } from '@/types/scene'

export function useScenes() {
  const [scenes, setScenes] = useState<Scene[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchScenes() {
      try {
        const response = await fetch('/api/scenes')
        if (!response.ok) {
          throw new Error('Failed to fetch scenes')
        }
        const data = await response.json()
        setScenes(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchScenes()
  }, [])

  return { scenes, loading, error }
}

