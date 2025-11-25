import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isAdmin } from '@/lib/auth'
import { validateSplaticaUrl, extractSceneSlug } from '@/lib/scene-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const scene = await prisma.scene.findUnique({
      where: { id: params.id },
    })

    if (!scene) {
      return NextResponse.json({ error: 'Scene not found' }, { status: 404 })
    }

    return NextResponse.json(scene)
  } catch (error) {
    console.error('Error fetching scene:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scene' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const scene = await prisma.scene.update({
      where: { id: params.id },
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

    return NextResponse.json(scene)
  } catch (error) {
    console.error('Error updating scene:', error)
    return NextResponse.json(
      { error: 'Failed to update scene' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await prisma.scene.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting scene:', error)
    return NextResponse.json(
      { error: 'Failed to delete scene' },
      { status: 500 }
    )
  }
}

