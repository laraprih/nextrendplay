'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingProduct, ViralVideo, DashboardStats } from '@/types'
import {
  mockProducts, mockVideos, mockStats,
  engagementChartData, categoryChartData, marketplaceChartData, spendTrendData,
} from '@/lib/mockData'
import StatCard from '@/components/ui/StatCard'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import VideoCard from './VideoCard'
import VideoPlayerModal from './VideoPlayerModal'
import SearchBar from './SearchBar'
import { EngagementChart, CategoryChart, SpendChart, PlatformChart } from './Charts'
import { TrendingUp, BarChart3, Eye, DollarSign, Flame, Video, ShoppingBag, Zap } from 'lucide-react'

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}
function fmtCurrency(n: number): string {
  if (n >= 1000000) return `R$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`
  return `R$${n}`
}

// Normaliza a categoria para comparação com os filtros
function matchesCategory(itemCategory: string, filter: string): boolean {
  if (filter === 'Todos') return true
  const cat = itemCategory.toLowerCase()
  const f = filter.toLowerCase()
  return cat.includes(f) || f.includes(cat.split(' ')[0].toLowerCase())
}

interface DashboardProps { activeTab: string }

export default function Dashboard({ activeTab }: DashboardProps) {
  const [products, setProducts] = useState<TrendingProduct[]>(mockProducts)
  const [videos, setVideos]     = useState<ViralVideo[]>(mockVideos)
  const [stats, setStats]       = useState<DashboardStats>(mockStats)
  const [loading, setLoading]   = useState(false)
  const [videoSource, setVideoSource]   = useState<string>('mock')
  const [productSource, setProductSource] = useState<string>('mock')
  const [selectedProduct, setSelectedProduct] = useState<TrendingProduct | null>(null)
  const [selectedVideo, setSelectedVideo]     = useState<ViralVideo | null>(null)
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [searchQuery, setSearchQuery]       = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [vr, pr, sr] = await Promise.all([
        fetch('/api/trending?type=videos'),
        fetch('/api/trending?type=products'),
        fetch('/api/trending?type=stats'),
      ])
      const vd = await vr.json()
      const pd = await pr.json()
      const sd = await sr.json()

      if (vd?.data?.length) {
        setVideos(vd.data)
        setVideoSource(vd.source ?? 'mock')
      }
      if (pd?.data?.length) {
        setProducts(pd.data)
        setProductSource(pd.source ?? 'mock')
      }
      if (sd?.data) setStats(sd.data)
    } catch {
      setVideos(mockVideos)
      setProducts(mockProducts)
      setStats(mockStats)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Resetar filtros ao trocar de aba
  useEffect(() => {
    setActiveCategory('Todos')
    setSearchQuery('')
  }, [activeTab])

  const q = searchQuery.toLowerCase()

  const filteredProducts = products.filter(p => {
    const matchCat = matchesCategory(p.category, activeCategory)
    const matchQ = !q || p.name.toLowerCase().includes(q) || p.pageName.toLowerCase().includes(q) ||
      p.marketplaces.some(m => m.platform.includes(q)) ||
      p.hashtags?.some(h => h.toLowerCase().includes(q))
    return matchCat && matchQ
  })

  const filteredVideos = videos.filter(v => {
    const matchCat = matchesCategory(v.category, activeCategory)
    const matchQ = !q || v.title.toLowerCase().includes(q) || v.author.toLowerCase().includes(q) ||
      v.hashtags.some(h => h.toLowerCase().includes(q)) ||
      v.linkedProduct?.name.toLowerCase().includes(q) ||
      v.linkedProduct?.marketplace.includes(q)
    return matchCat && matchQ
  })

  // ── DASHBOARD ──────────────────────────────────────────────────────────────
  if (activeTab === 'dashboard') {
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard title="Produtos Virais"   value={stats.totalProducts}                  subtitle="detectados hoje"   icon={Flame}      color="purple" trend={23} />
          <StatCard title="Vídeos Virais"      value={stats.totalVideos}                    subtitle="monitorados"       icon={Video}      color="pink"   trend={31} />
          <StatCard title="Impressões Máx."   value={fmt(stats.totalImpressionsMax)}        subtitle="alcance estimado"  icon={Eye}        color="blue"   trend={41} />
          <StatCard title="Investimento Máx." value={fmtCurrency(stats.totalSpendMax)}      subtitle="gasto estimado"    icon={DollarSign} color="green"  trend={18} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EngagementChart data={engagementChartData} />
          <SpendChart data={spendTrendData} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CategoryChart data={categoryChartData} />
          <PlatformChart data={marketplaceChartData} title="Top Marketplaces" />
        </div>

        <section>
          <SectionHeader title="Vídeos Mais Virais" count={videos.length} source={videoSource} icon={<Video className="w-4 h-4" style={{ color: 'var(--accent)' }} />} />
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {videos.slice(0, 5).map((v, i) => (
              <VideoCard key={v.id} video={v} rank={i + 1} onPlay={setSelectedVideo} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Produtos Mais Virais" count={products.length} source={productSource} icon={<TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />} />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((p, i) => (
              <ProductCard key={p.id} product={p} rank={i + 1} onClick={setSelectedProduct} />
            ))}
          </div>
        </section>

        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      </div>
    )
  }

  // ── VÍDEOS VIRAIS ──────────────────────────────────────────────────────────
  if (activeTab === 'videos') {
    return (
      <div className="space-y-4">
        <SectionHeader title="Vídeos Virais" count={filteredVideos.length} source={videoSource}
          icon={<Video className="w-5 h-5" style={{ color: 'var(--accent)' }} />} />
        <SearchBar onSearch={setSearchQuery} onFilter={setActiveCategory} onRefresh={fetchData}
          loading={loading} activeCategory={activeCategory} mode="videos" />

        {filteredVideos.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredVideos.map((v, i) => (
              <VideoCard key={v.id} video={v} rank={i + 1} onPlay={setSelectedVideo} />
            ))}
          </div>
        )}

        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      </div>
    )
  }

  // ── TIKTOK SHOP ────────────────────────────────────────────────────────────
  if (activeTab === 'tiktok') {
    const tiktokProducts = filteredProducts.filter(p =>
      p.platforms.includes('tiktok') || p.marketplaces.some(m => m.platform === 'tiktokshop')
    )
    const tiktokVideos = filteredVideos.filter(v =>
      v.platform === 'tiktok' || v.linkedProduct?.marketplace === 'tiktokshop'
    )
    return (
      <div className="space-y-5">
        <SectionHeader title="TikTok Shop" count={tiktokProducts.length + tiktokVideos.length}
          icon={<span className="text-lg">🎵</span>} />
        <SearchBar onSearch={setSearchQuery} onFilter={setActiveCategory} onRefresh={fetchData}
          loading={loading} activeCategory={activeCategory} />

        {tiktokVideos.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Vídeos TikTok
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {tiktokVideos.map((v, i) => (
                <VideoCard key={v.id} video={v} rank={i + 1} onPlay={setSelectedVideo} />
              ))}
            </div>
          </section>
        )}

        {tiktokProducts.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>
              Produtos no TikTok Shop
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tiktokProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} rank={i + 1} onClick={setSelectedProduct} />
              ))}
            </div>
          </section>
        )}

        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    )
  }

  // ── MARKETPLACES ───────────────────────────────────────────────────────────
  if (activeTab === 'marketplace') {
    const sorted = [...filteredProducts].sort((a, b) =>
      (b.marketplaces[0]?.soldCount || 0) - (a.marketplaces[0]?.soldCount || 0)
    )
    return (
      <div className="space-y-4">
        <SectionHeader title="Mais Vendidos nos Marketplaces" count={sorted.length}
          icon={<ShoppingBag className="w-5 h-5" style={{ color: 'var(--accent)' }} />} />
        <SearchBar onSearch={setSearchQuery} onFilter={setActiveCategory} onRefresh={fetchData}
          loading={loading} activeCategory={activeCategory} mode="products" />
        <ProductGrid products={sorted} loading={loading} onSelect={setSelectedProduct} />
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      </div>
    )
  }

  // ── PRODUTOS / ADS / SEARCH ────────────────────────────────────────────────
  const titles: Record<string, string> = {
    trending: 'Produtos Virais',
    ads: 'Todos os Anúncios',
    search: 'Pesquisar',
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title={titles[activeTab] || 'Produtos'}
        count={filteredProducts.length}
        icon={<BarChart3 className="w-5 h-5" style={{ color: 'var(--accent)' }} />}
      />
      <SearchBar onSearch={setSearchQuery} onFilter={setActiveCategory} onRefresh={fetchData}
        loading={loading} activeCategory={activeCategory} mode="products" />
      <ProductGrid products={filteredProducts} loading={loading} onSelect={setSelectedProduct} />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </div>
  )
}

// ── Subcomponentes ──────────────────────────────────────────────────────────

function ProductGrid({ products, loading, onSelect }: {
  products: TrendingProduct[]
  loading: boolean
  onSelect: (p: TrendingProduct) => void
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-2xl h-80 animate-pulse border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }} />
        ))}
      </div>
    )
  }
  if (products.length === 0) return <EmptyState />
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} rank={i + 1} onClick={onSelect} />
      ))}
    </div>
  )
}

const SOURCE_LABELS: Record<string, string> = {
  youtube:      '▶ YouTube ao vivo',
  tiktok:       '🎵 TikTok ao vivo',
  scraper:      '🔴 Scraper ao vivo',
  mercadolivre: '🛒 ML ao vivo',
  meta:         '📱 Meta ao vivo',
}

function SectionHeader({ title, count, icon, source }: {
  title: string; count: number; icon: React.ReactNode
  source?: string
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
        {icon}{title}
      </h2>
      <div className="flex items-center gap-2">
        {source && source !== 'mock' && (
          <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold border"
            style={{ backgroundColor: '#dcfce7', color: '#16a34a', borderColor: '#bbf7d0' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            {SOURCE_LABELS[source ?? ''] ?? source}
          </span>
        )}
        {source === 'mock' && (
          <span className="text-[10px] px-2 py-0.5 rounded-full border"
            style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-muted)', borderColor: 'var(--border)' }}>
            dados demo
          </span>
        )}
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
          {count} itens
        </span>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-16 space-y-2">
      <p className="text-2xl">🔍</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Nenhum resultado encontrado</p>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Tente outro termo ou categoria</p>
    </div>
  )
}
