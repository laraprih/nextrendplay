import { TrendingProduct } from '@/types'
import { mockProducts } from './mockData'

// AdData shim para compatibilidade com a Meta Ad Library API
interface AdData {
  id: string
  ad_creative_bodies?: string[]
  ad_creative_link_titles?: string[]
  ad_delivery_start_time: string
  ad_snapshot_url: string
  page_id: string
  page_name: string
  publisher_platforms?: string[]
  impressions?: { lower_bound: string; upper_bound: string }
  spend?: { lower_bound: string; upper_bound: string }
  currency?: string
}

const META_API_BASE = 'https://graph.facebook.com/v19.0'
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || ''

interface AdLibrarySearchParams {
  search_terms?: string
  ad_type?: string
  ad_reached_countries?: string[]
  search_page_ids?: string[]
  limit?: number
  fields?: string[]
}

export async function searchAdLibrary(params: AdLibrarySearchParams): Promise<AdData[]> {
  if (!ACCESS_TOKEN) {
    return []
  }

  const fields = params.fields || [
    'id',
    'ad_creative_bodies',
    'ad_creative_link_titles',
    'ad_creative_link_descriptions',
    'ad_delivery_start_time',
    'ad_delivery_stop_time',
    'ad_snapshot_url',
    'page_id',
    'page_name',
    'publisher_platforms',
    'impressions',
    'spend',
    'currency',
    'demographic_distribution',
    'delivery_by_region',
  ]

  const searchParams = new URLSearchParams({
    access_token: ACCESS_TOKEN,
    ad_type: params.ad_type || 'ALL',
    ad_reached_countries: JSON.stringify(params.ad_reached_countries || ['BR']),
    search_terms: params.search_terms || '',
    fields: fields.join(','),
    limit: String(params.limit || 50),
  })

  const url = `${META_API_BASE}/ads_archive?${searchParams}`

  const res = await fetch(url, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error(`Meta API error: ${res.status}`)

  const data = await res.json()
  return data.data || []
}

export async function getTrendingProducts(): Promise<TrendingProduct[]> {
  if (!ACCESS_TOKEN) {
    return mockProducts
  }

  const ads = await searchAdLibrary({
    search_terms: '',
    ad_type: 'ALL',
    ad_reached_countries: ['BR'],
    limit: 100,
  })

  return processAdsIntoProducts(ads)
}

function processAdsIntoProducts(ads: AdData[]): TrendingProduct[] {
  const grouped = ads.reduce<Record<string, AdData[]>>((acc, ad) => {
    const key = ad.page_id
    if (!acc[key]) acc[key] = []
    acc[key].push(ad)
    return acc
  }, {})

  return Object.entries(grouped).map(([pageId, pageAds], i) => {
    const firstAd = pageAds[0]
    const totalImprMin = pageAds.reduce((s, a) => s + parseInt(a.impressions?.lower_bound || '0'), 0)
    const totalImprMax = pageAds.reduce((s, a) => s + parseInt(a.impressions?.upper_bound || '0'), 0)
    const totalSpendMin = pageAds.reduce((s, a) => s + parseInt(a.spend?.lower_bound || '0'), 0)
    const totalSpendMax = pageAds.reduce((s, a) => s + parseInt(a.spend?.upper_bound || '0'), 0)
    const engagementScore = Math.min(100, Math.round((totalImprMax / 1000000) * 10))

    return {
      id: pageId,
      name: firstAd.ad_creative_link_titles?.[0] || firstAd.ad_creative_bodies?.[0]?.slice(0, 50) || 'Produto',
      category: 'Geral',
      thumbnail: firstAd.ad_snapshot_url,
      engagementScore,
      impressionsMin: totalImprMin,
      impressionsMax: totalImprMax,
      spendMin: totalSpendMin,
      spendMax: totalSpendMax,
      adsCount: pageAds.length,
      platforms: (firstAd.publisher_platforms || []) as import('@/types').SocialPlatform[],
      marketplaces: [],
      startDate: firstAd.ad_delivery_start_time,
      pageName: firstAd.page_name,
      pageId,
      country: 'BR',
      trend: (engagementScore > 80 ? 'up' : engagementScore > 50 ? 'stable' : 'down') as 'up' | 'down' | 'stable',
      trendPercent: Math.round(engagementScore * 2.5),
      type: 'ad' as import('@/types').ContentType,
    }
  })
}
