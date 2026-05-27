'use client'

import { MarketplacePlatform, SocialPlatform } from '@/types'

// ── Marketplace configs ──────────────────────────────────────────────────────

const marketplaceConfig: Record<MarketplacePlatform, { label: string; bg: string; text: string; icon: string }> = {
  shopee:       { label: 'Shopee',       bg: '#ff5722', text: '#fff',    icon: '🛍️' },
  amazon:       { label: 'Amazon',       bg: '#ff9900', text: '#111',    icon: '📦' },
  mercadolivre: { label: 'Mercado Livre',bg: '#ffe600', text: '#333',    icon: '🛒' },
  magalu:       { label: 'Magalu',       bg: '#0066cc', text: '#fff',    icon: '💙' },
  americanas:   { label: 'Americanas',   bg: '#e8162b', text: '#fff',    icon: '🔴' },
  shein:        { label: 'SHEIN',        bg: '#000000', text: '#fff',    icon: '✂️' },
  aliexpress:   { label: 'AliExpress',   bg: '#ff4747', text: '#fff',    icon: '🌐' },
  tiktokshop:   { label: 'TikTok Shop', bg: '#010101', text: '#fff',    icon: '🎵' },
  shopify:      { label: 'Shopify',      bg: '#5a8e3e', text: '#fff',    icon: '🏪' },
  outro:        { label: 'Loja',         bg: '#6b7280', text: '#fff',    icon: '🏷️' },
}

const socialConfig: Record<SocialPlatform, { label: string; bg: string; text: string; icon: string }> = {
  tiktok:    { label: 'TikTok',    bg: '#010101', text: '#fff', icon: '🎵' },
  instagram: { label: 'Instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', text: '#fff', icon: '📸' },
  facebook:  { label: 'Facebook',  bg: '#1877f2', text: '#fff', icon: '👤' },
  youtube:   { label: 'YouTube',   bg: '#ff0000', text: '#fff', icon: '▶️' },
  reels:     { label: 'Reels',     bg: 'linear-gradient(45deg,#f09433,#dc2743,#bc1888)', text: '#fff', icon: '🎬' },
  shorts:    { label: 'Shorts',    bg: '#ff0000', text: '#fff', icon: '⚡' },
}

interface MarketplaceBadgeProps {
  platform: MarketplacePlatform
  size?: 'sm' | 'md'
}

export function MarketplaceBadge({ platform, size = 'sm' }: MarketplaceBadgeProps) {
  const cfg = marketplaceConfig[platform]
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${px} whitespace-nowrap`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="text-[10px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

interface SocialBadgeProps {
  platform: SocialPlatform
  size?: 'sm' | 'md'
}

export function SocialBadge({ platform, size = 'sm' }: SocialBadgeProps) {
  const cfg = socialConfig[platform]
  const px = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${px} whitespace-nowrap`}
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="text-[10px]">{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}

export function MarketplaceIcon({ platform, className }: { platform: MarketplacePlatform; className?: string }) {
  return <span className={className}>{marketplaceConfig[platform].icon}</span>
}
