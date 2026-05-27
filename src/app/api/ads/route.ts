import { NextRequest, NextResponse } from 'next/server'
import { getTrendingProducts, searchAdLibrary } from '@/lib/metaApi'
import { mockStats } from '@/lib/mockData'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'products'

  try {
    if (type === 'stats') {
      return NextResponse.json(mockStats)
    }

    if (type === 'ads') {
      const search = searchParams.get('q') || ''
      const ads = await searchAdLibrary({ search_terms: search })
      return NextResponse.json(ads)
    }

    const products = await getTrendingProducts()
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 })
  }
}
