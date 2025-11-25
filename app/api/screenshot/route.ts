import { NextRequest, NextResponse } from 'next/server'
import { isAdmin } from '@/lib/auth'
import puppeteer from 'puppeteer'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate it's a Splatica URL
    if (!url.includes('app.splatica.com/viewer/')) {
      return NextResponse.json(
        { error: 'Invalid Splatica URL' },
        { status: 400 }
      )
    }

    // Extract scene slug for filename
    const sceneSlug = url.match(/viewer\/([^\/\?]+)/)?.[1] || 'screenshot'
    
    // Create screenshots directory if it doesn't exist
    const screenshotsDir = join(process.cwd(), 'public', 'screenshots')
    if (!existsSync(screenshotsDir)) {
      await mkdir(screenshotsDir, { recursive: true })
    }

    const filename = `${sceneSlug}-${Date.now()}.png`
    const filepath = join(screenshotsDir, filename)
    const publicUrl = `/screenshots/${filename}`

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })

    try {
      const page = await browser.newPage()
      
      // Set viewport size
      await page.setViewport({
        width: 1280,
        height: 720,
        deviceScaleFactor: 1,
      })

      // Navigate to the page and wait for it to load
      await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      })

      // Wait a bit more for any dynamic content to render
      await page.waitForTimeout(2000)

      // Take screenshot
      await page.screenshot({
        path: filepath,
        type: 'png',
        fullPage: false,
      })

      await browser.close()

      return NextResponse.json({ thumbnailUrl: publicUrl })
    } catch (screenshotError) {
      await browser.close()
      console.error('Screenshot error:', screenshotError)
      
      // Fallback: try to extract og:image
      try {
        const pageResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })
        const html = await pageResponse.text()
        const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i)
        
        if (ogImageMatch && ogImageMatch[1]) {
          return NextResponse.json({ thumbnailUrl: ogImageMatch[1] })
        }
      } catch (e) {
        console.error('OG image extraction error:', e)
      }
      
      return NextResponse.json(
        { error: 'Failed to generate screenshot. Please enter thumbnail URL manually.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in screenshot API:', error)
    return NextResponse.json(
      { error: 'Failed to generate screenshot' },
      { status: 500 }
    )
  }
}

