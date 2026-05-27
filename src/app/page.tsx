'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import Dashboard from '@/components/dashboard/Dashboard'
import { useTheme } from '@/components/ThemeProvider'
import { Menu, TrendingUp, Bell, Sun, Moon } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggle } = useTheme()

  const tabLabels: Record<string, string> = {
    dashboard:   'Dashboard',
    videos:      'Vídeos Virais',
    trending:    'Produtos Virais',
    tiktok:      'TikTok Shop',
    marketplace: 'Marketplaces',
    ads:         'Anúncios',
    search:      'Pesquisar',
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg-base)' }}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 border-r" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
            <Sidebar activeTab={activeTab} onTabChange={(t) => { setActiveTab(t); setMobileMenuOpen(false) }} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 backdrop-blur-xl border-b flex items-center px-4 gap-3 shrink-0"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="lg:hidden w-6 h-6 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {tabLabels[activeTab]}
            </h2>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs rounded-full px-3 py-1.5 border"
              style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Meta Ad Library Ativo
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: 'var(--text-secondary)' }}
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button className="relative p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-600/5 blur-3xl" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-pink-600/5 blur-3xl" />
          </div>
          <Dashboard activeTab={activeTab} />
        </main>
      </div>
    </div>
  )
}
