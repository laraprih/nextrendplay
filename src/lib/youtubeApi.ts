/**
 * Busca vídeos reais do YouTube com estatísticas completas.
 *
 * Usa dois métodos combinados:
 * 1. chart=mostPopular por categoria (vídeos realmente mais assistidos no Brasil)
 * 2. Busca por termos de produtos virais (review, unboxing, haul, etc.)
 */

import { ViralVideo } from '@/types'
import { buildMarketplaceUrl } from './marketplaceUrl'

const YT_BASE = 'https://www.googleapis.com/youtube/v3'

// Categorias YouTube com mapeamento para categorias do app
const POPULAR_CATEGORIES = [
  { ytId: '26', label: 'Beleza',          appCat: 'Beleza'          }, // How-to & Style
  { ytId: '28', label: 'Tecnologia',      appCat: 'Tecnologia'      }, // Science & Tech
  { ytId: '22', label: 'Entretenimento',  appCat: 'Entretenimento'  }, // People & Blogs
  { ytId: '24', label: 'Entretenimento',  appCat: 'Entretenimento'  }, // Entertainment
  { ytId: '17', label: 'Esportes/Moda',   appCat: 'Moda'            }, // Sports
]

// Buscas específicas por produtos virais - retorna reviews reais
const PRODUCT_QUERIES = [
  { q: 'review produto viral shopee brasil',         cat: 'Tecnologia'  },
  { q: 'unboxing gadget viral tiktok brasil',        cat: 'Tecnologia'  },
  { q: 'haul shopee produtos virais brasil 2025',    cat: 'Moda'        },
  { q: 'massageador cervical viral review antes depois', cat: 'Saúde'   },
  { q: 'skincare rotina facial produto viral',       cat: 'Beleza'      },
  { q: 'airfryer receita viral brasil',              cat: 'Culinária'   },
  { q: 'smartwatch barato shopee vale a pena',       cat: 'Tecnologia'  },
  { q: 'câmera segurança wifi 4k instalação',        cat: 'Segurança'   },
  { q: 'led planta indoor crescimento viral',        cat: 'Casa'        },
  { q: 'colágeno suplemento pele resultado viral',   cat: 'Beleza'      },
  { q: 'mini projetor portátil review unboxing',     cat: 'Entretenimento' },
  { q: 'tênis feminino moda viral haul shein',       cat: 'Moda'        },
]

interface YTItem {
  id: string | { videoId: string }
  snippet?: {
    title: string
    description: string
    thumbnails?: { maxres?: { url: string }; high?: { url: string }; medium?: { url: string } }
    channelTitle: string
    publishedAt: string
    tags?: string[]
    categoryId?: string
  }
  statistics?: {
    viewCount?: string
    likeCount?: string
    commentCount?: string
  }
  contentDetails?: { duration?: string }
}

function parseDuration(iso = ''): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!m) return '0:00'
  const h = parseInt(m[1] || '0')
  const min = parseInt(m[2] || '0')
  const sec = parseInt(m[3] || '0')
  return h > 0
    ? `${h}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${min}:${String(sec).padStart(2, '0')}`
}

function detectInfo(title: string, desc: string, appCat: string) {
  const text = (title + ' ' + desc).toLowerCase()

  let category = appCat
  if (!category || category === 'Geral') {
    if (/saúde|massagea|dor|colágeno|suplemento|vitamina|ems|tens/.test(text)) category = 'Saúde'
    else if (/skincare|beleza|maquiagem|cabelo|pele|creme|sérum/.test(text)) category = 'Beleza'
    else if (/roupa|moda|tênis|sapato|shein|haul|fashion/.test(text)) category = 'Moda'
    else if (/planta|jardim|organiz|decor/.test(text)) category = 'Casa'
    else if (/receita|airfryer|cozinha|comida|gastronomia/.test(text)) category = 'Culinária'
    else if (/câmera|segurança|cctv|monitoramento/.test(text)) category = 'Segurança'
    else if (/projetor|cinema|netflix|streaming/.test(text)) category = 'Entretenimento'
    else category = 'Tecnologia'
  }

  let marketplace: 'shopee' | 'amazon' | 'mercadolivre' | 'magalu' | 'americanas' | 'shein' | 'aliexpress' | 'tiktokshop' = 'shopee'
  if (/amazon/.test(text)) marketplace = 'amazon'
  else if (/mercado livre|mercadolivre/.test(text)) marketplace = 'mercadolivre'
  else if (/magalu|magazine/.test(text)) marketplace = 'magalu'
  else if (/americanas/.test(text)) marketplace = 'americanas'
  else if (/shein/.test(text)) marketplace = 'shein'
  else if (/aliexpress/.test(text)) marketplace = 'aliexpress'
  else if (/tiktok shop|tiktokshop/.test(text)) marketplace = 'tiktokshop'

  const productName = title
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[☀-➿]/gu, '')
    .replace(/[|!?\[\]()]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 6)
    .join(' ')

  const platform: ViralVideo['platform'] = /\bshorts\b/i.test(title) ? 'shorts' : 'youtube'

  return { category, marketplace, productName, platform }
}

function buildVideo(item: YTItem, appCat: string): ViralVideo | null {
  const videoId = typeof item.id === 'string' ? item.id : item.id?.videoId
  if (!videoId) return null

  const snippet = item.snippet
  const stats   = item.statistics
  const views    = parseInt(stats?.viewCount  || '0')
  const likes    = parseInt(stats?.likeCount  || '0')
  const comments = parseInt(stats?.commentCount || '0')
  const shares   = Math.round(likes * 0.1)
  const duration = parseDuration(item.contentDetails?.duration)
  const title    = snippet?.title ?? ''
  const desc     = snippet?.description ?? ''
  const thumbnail = snippet?.thumbnails?.maxres?.url
    ?? snippet?.thumbnails?.high?.url
    ?? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
  const tags = (snippet?.tags ?? []).slice(0, 6).map(t => `#${t.replace(/\s+/g, '')}`)

  const trendScore = Math.min(99, Math.max(62,
    views > 50_000_000 ? 99 :
    views > 10_000_000 ? 96 :
    views > 5_000_000  ? 92 :
    views > 1_000_000  ? 85 :
    views > 500_000    ? 78 : 68
  ))

  const { category, marketplace, productName, platform } = detectInfo(title, desc, appCat)

  return {
    id: `yt_${videoId}`,
    title,
    thumbnail,
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=https://nextrend-livid.vercel.app`,
    platform,
    views,
    likes,
    comments,
    shares,
    duration,
    author: snippet?.channelTitle ?? '',
    category,
    hashtags: tags.length ? tags : [`#${category.toLowerCase()}`, '#viral', '#brasil'],
    postedAt: (snippet?.publishedAt ?? new Date().toISOString()).slice(0, 10),
    trendScore,
    linkedProduct: {
      name: productName,
      marketplace,
      url: buildMarketplaceUrl(marketplace, productName),
      price: 0,
    },
  }
}

async function fetchVideoStats(videoIds: string[], apiKey: string): Promise<Record<string, YTItem>> {
  if (!videoIds.length) return {}
  const params = new URLSearchParams({
    key: apiKey,
    id: videoIds.join(','),
    part: 'statistics,snippet,contentDetails',
  })
  const res = await fetch(`${YT_BASE}/videos?${params}`, { next: { revalidate: 1800 } })
  if (!res.ok) return {}
  const data = await res.json()
  const map: Record<string, YTItem> = {}
  ;(data.items ?? []).forEach((v: YTItem) => { map[v.id as string] = v })
  return map
}

// ── 1. Vídeos mais populares do Brasil por categoria ─────────────────────────
async function fetchMostPopular(apiKey: string, maxPerCat = 5): Promise<ViralVideo[]> {
  const allIds: { id: string; cat: string }[] = []

  await Promise.all(
    POPULAR_CATEGORIES.map(async ({ ytId, appCat }) => {
      const params = new URLSearchParams({
        key: apiKey,
        chart: 'mostPopular',
        regionCode: 'BR',
        hl: 'pt_BR',
        videoCategoryId: ytId,
        part: 'id',
        maxResults: String(maxPerCat),
      })
      try {
        const res = await fetch(`${YT_BASE}/videos?${params}`, { next: { revalidate: 1800 } })
        if (!res.ok) return
        const data = await res.json()
        ;(data.items ?? []).forEach((v: { id: string }) => {
          allIds.push({ id: v.id, cat: appCat })
        })
      } catch { /* ignora */ }
    })
  )

  const uniqueIds = [...new Map(allIds.map(x => [x.id, x])).values()]
  const statsMap = await fetchVideoStats(uniqueIds.map(x => x.id), apiKey)

  return uniqueIds
    .map(({ id, cat }) => buildVideo({ ...statsMap[id], id }, cat))
    .filter((v): v is ViralVideo => v !== null)
}

// ── 2. Busca de produto viral específico ─────────────────────────────────────
async function fetchProductSearchVideos(apiKey: string, perQuery = 2): Promise<ViralVideo[]> {
  const publishedAfter = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
  const allIds: { id: string; cat: string }[] = []

  await Promise.all(
    PRODUCT_QUERIES.map(async ({ q, cat }) => {
      const params = new URLSearchParams({
        key: apiKey,
        q,
        type: 'video',
        part: 'id',
        maxResults: String(perQuery),
        regionCode: 'BR',
        relevanceLanguage: 'pt',
        order: 'viewCount',
        publishedAfter,
      })
      try {
        const res = await fetch(`${YT_BASE}/search?${params}`, { next: { revalidate: 1800 } })
        if (!res.ok) return
        const data = await res.json()
        ;(data.items ?? []).forEach((item: { id?: { videoId?: string } }) => {
          const vid = item.id?.videoId
          if (vid) allIds.push({ id: vid, cat })
        })
      } catch { /* ignora */ }
    })
  )

  const uniqueIds = [...new Map(allIds.map(x => [x.id, x])).values()]
  const statsMap = await fetchVideoStats(uniqueIds.map(x => x.id), apiKey)

  return uniqueIds
    .map(({ id, cat }) => buildVideo({ ...statsMap[id], id }, cat))
    .filter((v): v is ViralVideo => v !== null)
}

// ── Exportação principal ─────────────────────────────────────────────────────
export async function fetchTrendingYouTubeVideos(): Promise<ViralVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return []

  const [popular, searched] = await Promise.allSettled([
    fetchMostPopular(apiKey, 4),
    fetchProductSearchVideos(apiKey, 2),
  ])

  const popularVids  = popular.status  === 'fulfilled' ? popular.value  : []
  const searchedVids = searched.status === 'fulfilled' ? searched.value : []

  // Combina, remove duplicatas por videoId, ordena por views
  const allMap = new Map<string, ViralVideo>()
  ;[...popularVids, ...searchedVids].forEach(v => allMap.set(v.id, v))

  return [...allMap.values()].sort((a, b) => b.views - a.views)
}
