/**
 * Mercado Livre API pública.
 * Requer App Token gratuito: developers.mercadolivre.com.br
 *
 * Como obter (5 min):
 * 1. Acesse https://developers.mercadolivre.com.br
 * 2. Crie uma aplicação com qualquer nome
 * 3. Vá em "Credenciais" e copie client_id e client_secret
 * 4. Adicione no .env.local:
 *    ML_CLIENT_ID=seu_client_id
 *    ML_CLIENT_SECRET=seu_client_secret
 */

import { TrendingProduct } from '@/types'
import { buildMarketplaceUrl } from './marketplaceUrl'

const ML_BASE = 'https://api.mercadolibre.com'

// Categorias mais relevantes para produtos virais no Brasil
const ML_CATEGORIES = [
  { id: 'MLB1051', name: 'Celulares e Telefones',    appCat: 'Tecnologia'  },
  { id: 'MLB1648', name: 'Computação',               appCat: 'Tecnologia'  },
  { id: 'MLB1246', name: 'Beleza e Cuidado Pessoal', appCat: 'Beleza'      },
  { id: 'MLB1430', name: 'Saúde',                    appCat: 'Saúde'       },
  { id: 'MLB1000', name: 'Eletrônicos',               appCat: 'Tecnologia'  },
  { id: 'MLB1574', name: 'Casa, Móveis e Decoração', appCat: 'Casa'        },
  { id: 'MLB1459', name: 'Moda',                     appCat: 'Moda'        },
  { id: 'MLB218519', name: 'Esportes e Fitness',     appCat: 'Saúde'       },
]

interface MLToken { access_token: string; expires_in: number }

let cachedToken: string | null = null
let tokenExpiry = 0

async function getAppToken(): Promise<string | null> {
  const clientId     = process.env.ML_CLIENT_ID
  const clientSecret = process.env.ML_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  if (cachedToken && Date.now() < tokenExpiry) return cachedToken

  try {
    const res = await fetch(`${ML_BASE}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    if (!res.ok) return null
    const data: MLToken = await res.json()
    cachedToken = data.access_token
    tokenExpiry = Date.now() + (data.expires_in - 60) * 1000
    return cachedToken
  } catch {
    return null
  }
}

interface MLItem {
  id: string
  title: string
  price: number
  original_price: number | null
  thumbnail: string
  permalink: string
  sold_quantity: number
  available_quantity: number
  condition: string
  seller: { id: number; nickname: string }
  shipping: { free_shipping: boolean }
  reviews?: { rating_average: number; total: number }
  attributes?: Array<{ id: string; name: string; value_name: string }>
}

export async function fetchMLTrendingProducts(limit = 10): Promise<TrendingProduct[]> {
  const token = await getAppToken()
  if (!token) return []

  const headers = { Authorization: `Bearer ${token}` }
  const allProducts: TrendingProduct[] = []

  await Promise.all(
    ML_CATEGORIES.slice(0, 5).map(async ({ id: catId, appCat }) => {
      try {
        // Busca os mais vendidos de cada categoria
        const params = new URLSearchParams({
          category: catId,
          sort: 'sold_quantity_desc',
          limit: String(Math.ceil(limit / ML_CATEGORIES.length) + 1),
        })
        const res = await fetch(`${ML_BASE}/sites/MLB/search?${params}`, {
          headers,
          next: { revalidate: 1800 },
        })
        if (!res.ok) return

        const data = await res.json()
        const results: MLItem[] = data.results ?? []

        results.forEach((item, i) => {
          const score = Math.min(99, Math.max(65,
            item.sold_quantity > 10000 ? 96 :
            item.sold_quantity > 5000  ? 90 :
            item.sold_quantity > 1000  ? 82 :
            item.sold_quantity > 500   ? 75 : 68
          ))

          allProducts.push({
            id: `ml_${item.id}`,
            name: item.title,
            category: appCat,
            thumbnail: item.thumbnail?.replace('I.jpg', 'O.jpg') ?? '',
            engagementScore: score,
            impressionsMin: item.sold_quantity * 10,
            impressionsMax: item.sold_quantity * 50,
            spendMin: 0,
            spendMax: 0,
            adsCount: 0,
            platforms: ['instagram', 'tiktok'],
            marketplaces: [
              {
                platform: 'mercadolivre',
                url: item.permalink,
                price: item.price,
                originalPrice: item.original_price ?? undefined,
                rating: item.reviews?.rating_average ?? 4.5,
                soldCount: item.sold_quantity,
                seller: item.seller?.nickname,
              },
            ],
            startDate: new Date().toISOString().slice(0, 10),
            pageName: item.seller?.nickname ?? 'Mercado Livre',
            pageId: String(item.seller?.id ?? i),
            country: 'BR',
            trend: 'up',
            trendPercent: Math.round(score * 1.5),
            type: 'product',
            description: `${item.condition === 'new' ? 'Novo' : 'Usado'} · ${item.shipping.free_shipping ? 'Frete grátis' : ''}`,
            hashtags: [`#${appCat.toLowerCase()}`, '#mercadolivre', '#viral'],
          })
        })
      } catch { /* ignora categoria individual */ }
    })
  )

  // Ordena por engajamento, remove duplicatas
  return allProducts
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit)
}

export async function searchMLProducts(query: string, limit = 10): Promise<TrendingProduct[]> {
  const token = await getAppToken()
  if (!token) return []

  const headers = { Authorization: `Bearer ${token}` }

  try {
    const params = new URLSearchParams({
      q: query,
      site_id: 'MLB',
      sort: 'relevance',
      limit: String(limit),
    })
    const res = await fetch(`${ML_BASE}/sites/MLB/search?${params}`, {
      headers,
      next: { revalidate: 900 },
    })
    if (!res.ok) return []

    const data = await res.json()
    const results: MLItem[] = data.results ?? []

    return results.map((item, i): TrendingProduct => ({
      id: `ml_${item.id}`,
      name: item.title,
      category: 'Geral',
      thumbnail: item.thumbnail?.replace('I.jpg', 'O.jpg') ?? '',
      engagementScore: 75,
      impressionsMin: item.sold_quantity * 10,
      impressionsMax: item.sold_quantity * 50,
      spendMin: 0,
      spendMax: 0,
      adsCount: 0,
      platforms: ['instagram', 'tiktok'],
      marketplaces: [{
        platform: 'mercadolivre',
        url: item.permalink,
        price: item.price,
        originalPrice: item.original_price ?? undefined,
        rating: item.reviews?.rating_average ?? 4.5,
        soldCount: item.sold_quantity,
        seller: item.seller?.nickname,
      }],
      startDate: new Date().toISOString().slice(0, 10),
      pageName: item.seller?.nickname ?? 'ML',
      pageId: String(item.seller?.id ?? i),
      country: 'BR',
      trend: 'stable',
      trendPercent: 0,
      type: 'product',
    }))
  } catch {
    return []
  }
}

export function hasMLCredentials(): boolean {
  return !!(process.env.ML_CLIENT_ID && process.env.ML_CLIENT_SECRET)
}
