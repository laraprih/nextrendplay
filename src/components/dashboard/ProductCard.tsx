'use client'

import { TrendingProduct } from '@/types'
import { TrendingUp, TrendingDown, Minus, Eye, DollarSign, Hash, ExternalLink, ShoppingCart } from 'lucide-react'
import { MarketplaceBadge, SocialBadge } from '@/components/ui/PlatformBadge'

interface ProductCardProps {
  product: TrendingProduct
  rank: number
  onClick: (product: TrendingProduct) => void
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

function fmtCurrency(n: number): string {
  if (n >= 1000000) return `R$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `R$${(n / 1000).toFixed(0)}K`
  return `R$${n}`
}

const categoryBg: Record<string, string> = {
  'Tecnologia':       'bg-blue-500/12 text-blue-700 dark:text-blue-300',
  'Saúde & Bem-estar':'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
  'Saúde & Beleza':   'bg-pink-500/12 text-pink-700 dark:text-pink-300',
  'Casa & Jardim':    'bg-teal-500/12 text-teal-700 dark:text-teal-300',
  'Cozinha':          'bg-orange-500/12 text-orange-700 dark:text-orange-300',
  'Moda & Esportes':  'bg-purple-500/12 text-purple-700 dark:text-purple-300',
  'Entretenimento':   'bg-indigo-500/12 text-indigo-700 dark:text-indigo-300',
  'default':          'bg-gray-500/12 text-gray-700 dark:text-gray-300',
}

export default function ProductCard({ product, rank, onClick }: ProductCardProps) {
  const TrendIcon = product.trend === 'up' ? TrendingUp : product.trend === 'down' ? TrendingDown : Minus
  const trendColor = product.trend === 'up' ? 'var(--success)' : product.trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'
  const catColor = categoryBg[product.category] || categoryBg.default
  const bestMarketplace = product.marketplaces[0]
  const scoreColor = product.engagementScore >= 90 ? '#10b981' : product.engagementScore >= 70 ? '#f59e0b' : '#6366f1'

  return (
    <div
      onClick={() => onClick(product)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 border"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', boxShadow: 'var(--shadow)' }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = 'var(--shadow-hover)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = 'var(--shadow)')}
    >
      {/* Rank */}
      <div className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-full flex items-center justify-center border"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>#{rank}</span>
      </div>

      {/* Score */}
      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full border"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{product.engagementScore}</span>
      </div>

      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden" style={{ backgroundColor: 'var(--bg-elevated)' }}>
        <img
          src={product.thumbnail}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x300/6366f1/ffffff?text=${encodeURIComponent(product.name.slice(0,15))}`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Social platforms */}
        <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
          {product.platforms.slice(0, 2).map(p => (
            <SocialBadge key={p} platform={p} size="sm" />
          ))}
          {product.platforms.length > 2 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-black/60 text-white font-semibold">
              +{product.platforms.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <h3 className="text-xs font-semibold leading-snug line-clamp-2 flex-1" style={{ color: 'var(--text-primary)' }}>
            {product.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
            <TrendIcon className="w-3 h-3" style={{ color: trendColor }} />
            <span className="text-[10px] font-bold" style={{ color: trendColor }}>
              {product.trendPercent >= 0 ? '+' : ''}{product.trendPercent}%
            </span>
          </div>
        </div>

        <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mb-2.5 font-medium ${catColor}`}>
          {product.category}
        </span>

        {/* Marketplaces onde é vendido */}
        <div className="mb-2.5">
          <p className="text-[9px] uppercase tracking-wide mb-1 font-medium" style={{ color: 'var(--text-muted)' }}>
            Vendido em:
          </p>
          <div className="flex flex-wrap gap-1">
            {product.marketplaces.slice(0, 3).map(m => (
              <a
                key={m.platform}
                href={m.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
              >
                <MarketplaceBadge platform={m.platform} size="sm" />
              </a>
            ))}
            {product.marketplaces.length > 3 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-semibold"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                +{product.marketplaces.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Best price */}
        {bestMarketplace && (
          <a
            href={bestMarketplace.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-between p-2 rounded-xl border mb-2.5 hover:border-[color:var(--accent)] transition-all group/buy"
            style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
          >
            <div>
              <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>Melhor preço</p>
              <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                R${bestMarketplace.price?.toFixed(2).replace('.', ',')}
              </p>
              {bestMarketplace.soldCount && (
                <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {fmt(bestMarketplace.soldCount)} vendidos
                </p>
              )}
            </div>
            <div className="flex items-center gap-1">
              <MarketplaceBadge platform={bestMarketplace.platform} size="sm" />
              <ExternalLink className="w-3 h-3 opacity-40 group-hover/buy:opacity-100" style={{ color: 'var(--accent)' }} />
            </div>
          </a>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { icon: Eye, label: 'views', value: fmt(product.impressionsMax) },
            { icon: DollarSign, label: 'gasto', value: fmtCurrency(product.spendMax) },
            { icon: Hash, label: 'anúncios', value: product.adsCount.toString() },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col items-center rounded-lg p-1.5"
              style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <Icon className="w-3 h-3 mb-0.5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px] font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
              <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
