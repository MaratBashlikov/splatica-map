'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MapPicker from '@/components/MapPicker'
import { parseGoogleMapsUrl, isGoogleMapsUrl } from '@/lib/coords-utils'

export default function NewScenePage() {
  const router = useRouter()
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    splaticaUrl: '',
    lat: '',
    lng: '',
    thumbnailUrl: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingScreenshot, setGeneratingScreenshot] = useState(false)
  const [locationInput, setLocationInput] = useState('')
  const [parsingLocation, setParsingLocation] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/scenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          splaticaUrl: formData.splaticaUrl,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng),
          thumbnailUrl: formData.thumbnailUrl || undefined,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/admin')
      } else {
        setError(data.error || 'Failed to create scene')
      }
    } catch (err) {
      setError('Failed to create scene')
    } finally {
      setLoading(false)
    }
  }

  const handleMapSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, lat: lat.toString(), lng: lng.toString() })
  }

  const handleGenerateScreenshot = async () => {
    if (!formData.splaticaUrl) {
      setError('Please enter Splatica URL first')
      return
    }

    setGeneratingScreenshot(true)
    setError('')

    try {
      const response = await fetch('/api/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.splaticaUrl }),
      })

      const data = await response.json()

      if (response.ok) {
        setFormData({ ...formData, thumbnailUrl: data.thumbnailUrl })
      } else {
        setError(data.error || 'Failed to generate screenshot')
      }
    } catch (err) {
      setError('Failed to generate screenshot')
    } finally {
      setGeneratingScreenshot(false)
    }
  }

  const handleParseLocation = async () => {
    if (!locationInput.trim()) {
      setError('Please enter Google Maps URL or address')
      return
    }

    setParsingLocation(true)
    setError('')

    try {
      // Check if it's a Google Maps URL
      if (isGoogleMapsUrl(locationInput)) {
        const coords = parseGoogleMapsUrl(locationInput)
        if (coords) {
          setFormData({
            ...formData,
            lat: coords.lat.toString(),
            lng: coords.lng.toString(),
          })
          setLocationInput('')
        } else {
          setError('Could not extract coordinates from Google Maps URL')
        }
      } else {
        // Geocode the address
        const response = await fetch('/api/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: locationInput }),
        })

        const data = await response.json()

        if (response.ok) {
          setFormData({
            ...formData,
            lat: data.lat.toString(),
            lng: data.lng.toString(),
          })
          setLocationInput('')
        } else {
          setError(data.error || 'Failed to geocode address')
        }
      }
    } catch (err) {
      setError('Failed to parse location')
    } finally {
      setParsingLocation(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Add New Scene</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to list
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-xl p-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="splaticaUrl"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Splatica URL *
              </label>
              <input
                type="url"
                id="splaticaUrl"
                value={formData.splaticaUrl}
                onChange={(e) =>
                  setFormData({ ...formData, splaticaUrl: e.target.value })
                }
                placeholder="https://app.splatica.com/viewer/2424b5ce"
                className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Must be a valid Splatica viewer URL
              </p>
            </div>

            <div>
              <label
                htmlFor="thumbnailUrl"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Thumbnail URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="thumbnailUrl"
                  value={formData.thumbnailUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, thumbnailUrl: e.target.value })
                  }
                  placeholder="https://example.com/thumbnail.jpg"
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateScreenshot}
                  disabled={generatingScreenshot || !formData.splaticaUrl}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  title="Generate screenshot from Splatica URL"
                >
                  {generatingScreenshot ? 'Generating...' : '📸 Generate'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-400">
                Leave empty or click &quot;Generate&quot; to create screenshot automatically
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Coordinates *
              </label>
              
              {/* Google Maps URL or Address input */}
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleParseLocation()
                      }
                    }}
                    placeholder="Google Maps URL or address (e.g., 'Moscow, Russia' or 'https://maps.google.com/?q=55.7558,37.6173')"
                    className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleParseLocation}
                    disabled={parsingLocation || !locationInput.trim()}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    title="Parse coordinates from Google Maps URL or geocode address"
                  >
                    {parsingLocation ? 'Parsing...' : '📍 Parse'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  Paste Google Maps URL or enter an address to automatically fill coordinates
                </p>
              </div>

              {/* Manual coordinate inputs */}
              <div className="flex gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={formData.lat}
                  onChange={(e) =>
                    setFormData({ ...formData, lat: e.target.value })
                  }
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={formData.lng}
                  onChange={(e) =>
                    setFormData({ ...formData, lng: e.target.value })
                  }
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  Pick on Map
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Scene'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {showMapPicker && (
        <MapPicker
          initialLat={formData.lat ? parseFloat(formData.lat) : undefined}
          initialLng={formData.lng ? parseFloat(formData.lng) : undefined}
          onSelect={handleMapSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  )
}

