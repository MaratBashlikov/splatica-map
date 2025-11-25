export interface Scene {
  id: string
  title: string
  description: string | null
  splaticaUrl: string
  sceneSlug: string
  lat: number
  lng: number
  thumbnailUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface SceneInput {
  title: string
  description?: string
  splaticaUrl: string
  lat: number
  lng: number
  thumbnailUrl?: string
}

