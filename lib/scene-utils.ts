export function extractSceneSlug(url: string): string | null {
  try {
    const urlObj = new URL(url)
    if (urlObj.hostname !== 'app.splatica.com') {
      return null
    }
    const match = urlObj.pathname.match(/^\/viewer\/(.+)$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

export function validateSplaticaUrl(url: string): boolean {
  const slug = extractSceneSlug(url)
  return slug !== null
}

