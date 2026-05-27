'use client'

import { TrendingProduct } from '@/types'
import { X, TrendingUp, TrendingDown, Minus, Eye, DollarSign, Hash, Calendar, MapPin, ExternalLink, Star, ShoppingCart } from 'lucide-react'
import { MarketplaceBadge, SocialBadge } from '@/components/ui/PlatformBadge'

interface ProductModalProps {
  product: TrendingProduct | null
  onClose: () => void
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

function fmtBRL(n: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(n)
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  if (!product) return null

  const TrendIcon = product.trend === 'up' ? TrendingUp : product.trend === 'down' ? TrendingDown : Minus
  const trendColor = product.trend === 'up' ? 'var(--success)' : product.trend === 'down' ? 'var(--danger)' : 'var(--text-muted)'
  const scoreColor = product.engagementScore >= 90 ? '#10b981' : product.engagementScore >= 70 ? '#f59e0b' : '#6366f1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto border"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

        {/* Hero */}
        <div className="relative h-52">
          <img src={product.thumbnail} alt={product.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://via.placeholder.com/800x400/6366f1/ffffff?text=${encodeURIComponent(product.name.slice(0,20))}` }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border transition-colors hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <X className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
          </button>
          {/* Social platforms */}
          <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
            {product.platforms.map(p => <SocialBadge key={p} platform={p} size="sm" />)}
          </div>
        </div>

        <div className="p-5">
          {/* Title */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <h2 className="text-lg font-bold leading-snug flex-1" style={{ color: 'var(--text-primary)' }}>{product.name}</h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border shrink-0"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-elevated)' }}>
              <TrendIcon className="w-4 h-4" style={{ color: trendColor }} />
              <span className="text-sm font-bold" style={{ color: trendColor }}>
                {product.trendPercent >= 0 ? '+' : ''}{product.trendPercent}%
              </span>
            </div>
          </div>

          {product.description && (
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
          )}

          {/* Hashtags */}
          {product.hashtags && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {product.hashtags.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Score bar */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 rounded-full h-2" style={{ backgroundColor: 'var(--bg-elevated)' }}>
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                style={{ width: `${product.engagementScore}%` }} />
            </div>
            <span className="text-sm font-bold whitespace-nowrap" style={{ color: scoreColor }}>
              Score {product.engagementScore}/100
            </span>
          </div>

          {/* Impressions / spend / ads */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { icon: Eye, color: '#3b82f6', label: 'Impressões', value: `${fmt(product.impressionsMin)}–${fmt(product.impressionsMax)}` },
              { icon: DollarSign, color: '#10b981', label: 'Investimento', value: `R$${fmt(product.spendMin)}–R$${fmt(product.spendMax)}` },
              { icon: Hash, color: '#a855f7', label: 'Anúncios', value: `${product.adsCount}` },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="rounded-xl p-3 border text-center"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                <p className="text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Marketplaces */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: 'var(--text-muted)' }}>
              Onde comprar
            </h3>
            <div className="space-y-2">
              {product.marketplaces.map((m, i) => (
                <a key={m.platform} href={m.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-[color:var(--accent)] group/m"
                  style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                  <MarketplaceBadge platform={m.platform} size="md" />
                  <div className="flex-1 min-w-0">
                    {m.seller && <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>{m.seller}</p>}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{fmtBRL(m.price || 0)}</span>
                      {m.originalPrice && (
                        <span className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{fmtBRL(m.originalPrice)}</span>
                      )}
                      {m.originalPrice && m.price && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold text-white bg-red-500">
                          -{Math.round((1 - m.price / m.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {m.rating && (
                        <span className="flex items-center gap-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" /> {m.rating}
                        </span>
                      )}
                      {m.soldCount && (
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {fmt(m.soldCount)} vendidos
                        </span>
                      )}
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 shrink-0 opacity-30 group-hover/m:opacity-100 transition-opacity"
                    style={{ color: 'var(--accent)' }} />
                </a>
              ))}
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center justify-between py-2.5 border-t text-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Calendar className="w-3.5 h-3.5" />
              <span className="text-xs">Ativo desde {new Date(product.startDate).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">🇧🇷 Brasil</span>
            </div>
          </div>

          {/* CTA */}
          <a href={`https://www.facebook.com/ads/library/?q=${encodeURIComponent(product.name)}&active_status=active&ad_type=all&country=BR`}
            target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, var(--accent), #ec4899)' }}>
            <ExternalLink className="w-4 h-4" />
            Ver na Biblioteca de Anúncios Meta
          </a>
        </div>
      </div>
    </div>
  )
}
