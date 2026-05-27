import { NextRequest, NextResponse } from 'next/server'
import { fetchTrendingYouTubeVideos } from '@/lib/youtubeApi'
import { fetchMLTrendingProducts, hasMLCredentials } from '@/lib/mercadolivreApi'
import { getTrendingProducts } from '@/lib/metaApi'
import { mockVideos, mockProducts, mockStats } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'videos'

  try {
    // ── VÍDEOS ───────────────────────────────────────────────────────────────
    if (type === 'videos') {
      if (process.env.YOUTUBE_API_KEY) {
        const videos = await fetchTrendingYouTubeVideos()
        if (videos.length > 0) return NextResponse.json({ source: 'youtube', data: videos })
      }

      return NextResponse.json({ source: 'mock', data: mockVideos })
    }

    // ── PRODUTOS ─────────────────────────────────────────────────────────────
    if (type === 'products') {
      if (hasMLCredentials()) {
        const products = await fetchMLTrendingProducts(24)
        if (products.length > 0) {
          return NextResponse.json({ source: 'mercadolivre', data: products })
        }
      }

      if (process.env.META_ACCESS_TOKEN) {
        const products = await getTrendingProducts()
        if (products.length > 0) {
          return NextResponse.json({ source: 'meta', data: products })
        }
      }

      return NextResponse.json({ source: 'mock', data: mockProducts })
    }

    // ── STATS ────────────────────────────────────────────────────────────────
    if (type === 'stats') {
      return NextResponse.json({ source: 'mock', data: mockStats })
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })

  } catch (err) {
    console.error('[/api/trending]', err)
    return NextResponse.json({
      source: 'mock',
      data: type === 'videos' ? mockVideos : mockProducts,
    })
  }
}
