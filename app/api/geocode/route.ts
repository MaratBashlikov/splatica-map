import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { address } = body

    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      )
    }

    // Use Mapbox Geocoding API
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!mapboxToken) {
      return NextResponse.json(
        { error: 'Mapbox token not configured' },
        { status: 500 }
      )
    }

    const encodedAddress = encodeURIComponent(address)
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`

    const response = await fetch(geocodeUrl)
    const data = await response.json()

    if (!response.ok || !data.features || data.features.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      )
    }

    const feature = data.features[0]
    const [lng, lat] = feature.center

    return NextResponse.json({
      lat,
      lng,
      placeName: feature.place_name,
    })
  } catch (error) {
    console.error('Error geocoding address:', error)
    return NextResponse.json(
      { error: 'Failed to geocode address' },
      { status: 500 }
    )
  }
}

