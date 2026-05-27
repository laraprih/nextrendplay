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
      // TikTok/Reels do mock — sempre incluídos para variedade de plataformas
      // O player busca YouTube equivalente pelo título quando não há embedUrl
      const tiktokEntries = mockVideos.filter(v =>
        v.platform === 'tiktok' || v.platform === 'reels'
      )

      if (process.env.YOUTUBE_API_KEY) {
        const ytVideos = await fetchTrendingYouTubeVideos()
        if (ytVideos.length > 0) {
          // Combina: YouTube real na frente + TikTok/Reels intercalados
          const combined = [...ytVideos]
          tiktokEntries.forEach((tt, i) => {
            const pos = Math.min(i * 4 + 2, combined.length)
            combined.splice(pos, 0, tt)
          })
          return NextResponse.json({ source: 'youtube+tiktok', data: combined })
        }
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
