'use client'

import { TrendingUp, LayoutDashboard, Flame, Search, Settings, Zap, Video, ShoppingBag } from 'lucide-react'

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navItems = [
  { id: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard },
  { id: 'videos',       label: 'Vídeos Virais',   icon: Video },
  { id: 'trending',     label: 'Produtos Virais', icon: Flame },
  { id: 'tiktok',       label: 'TikTok Shop',     icon: Zap },
  { id: 'marketplace',  label: 'Marketplaces',    icon: ShoppingBag },
  { id: 'search',       label: 'Pesquisar',       icon: Search },
]

const platformBadges = [
  { name: 'TikTok',    emoji: '🎵', color: '#010101' },
  { name: 'Instagram', emoji: '📸', color: '#e1306c' },
  { name: 'Shopee',    emoji: '🛍️', color: '#ff5722' },
  { name: 'TikTok Shop', emoji: '🛒', color: '#010101' },
]

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-62 border-r shrink-0"
      style={{ width: '240px', backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>

      {/* Logo */}
      <div className="p-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, var(--accent), #ec4899)' }}>
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>NexTrended</h1>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Viral Intelligence</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <p className="text-[9px] uppercase tracking-widest px-3 mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Menu</p>
        <ul className="space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id
            return (
              <li key={id}>
                <button
                  onClick={() => onTabChange(id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border"
                  style={isActive ? {
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                    borderColor: 'var(--accent)',
                    borderWidth: '1px',
                    opacity: 1,
                  } : {
                    color: 'var(--text-secondary)',
                    borderColor: 'transparent',
                    backgroundColor: 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                  {id === 'tiktok' && (
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full font-bold text-white bg-red-500">HOT</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Plataformas monitoradas */}
        <div className="mt-5">
          <p className="text-[9px] uppercase tracking-widest px-3 mb-2 font-semibold" style={{ color: 'var(--text-muted)' }}>Monitorando</p>
          <div className="space-y-1.5 px-1">
            {platformBadges.map(p => (
              <div key={p.name} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <span className="text-base">{p.emoji}</span>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border border-transparent"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-elevated)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <Settings className="w-4 h-4" />
          Configurações
        </button>
      </div>
    </aside>
  )
}
