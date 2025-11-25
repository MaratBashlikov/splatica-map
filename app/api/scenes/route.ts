import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'
import { validateSplaticaUrl, extractSceneSlug } from '@/lib/scene-utils'

export async function GET() {
  try {
    const scenes = await prisma.scene.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(scenes)
  } catch (error) {
    console.error('Error fetching scenes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scenes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, splaticaUrl, lat, lng, thumbnailUrl } = body

    if (!title || !splaticaUrl || lat === undefined || lng === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!validateSplaticaUrl(splaticaUrl)) {
      return NextResponse.json(
        { error: 'Invalid Splatica URL format' },
        { status: 400 }
      )
    }

    const sceneSlug = extractSceneSlug(splaticaUrl)
    if (!sceneSlug) {
      return NextResponse.json(
        { error: 'Could not extract scene slug from URL' },
        { status: 400 }
      )
    }

    const scene = await prisma.scene.create({
      data: {
        title,
        description: description || null,
        splaticaUrl,
        sceneSlug,
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        thumbnailUrl: thumbnailUrl || null,
      },
    })

    return NextResponse.json(scene, { status: 201 })
  } catch (error) {
    console.error('Error creating scene:', error)
    return NextResponse.json(
      { error: 'Failed to create scene' },
      { status: 500 }
    )
  }
}

