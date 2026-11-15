import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { url } = await request.json().catch(() => ({}))
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })
    const html = await res.text()

    const getOg = (prop: string) =>
      html.match(new RegExp(`<meta[^>]*property="${prop}"[^>]*content="([^"]+)"`))?.[1] ||
      html.match(new RegExp(`<meta[^>]*content="([^"]+)"[^>]*property="${prop}"`))?.[1]

    const title = getOg('og:title') || html.match(/<title>([^<]+)<\/title>/)?.[1]?.split(':')[0]?.trim()
    const image = getOg('og:image')

    return NextResponse.json({ title: title ?? null, image: image ?? null })
  } catch {
    return NextResponse.json({ title: null, image: null })
  }
}
