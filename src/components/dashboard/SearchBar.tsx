'use client'

import { Search, RefreshCw, X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SearchBarProps {
  onSearch: (q: string) => void
  onFilter: (category: string) => void
  onRefresh: () => void
  loading: boolean
  activeCategory: string
  mode?: 'products' | 'videos' | 'all'
}

const productCategories = ['Todos', 'Tecnologia', 'Saúde', 'Beleza', 'Casa', 'Cozinha', 'Moda', 'Entretenimento']
const videoCategories   = ['Todos', 'Tecnologia', 'Saúde', 'Beleza', 'Culinária', 'Moda', 'Segurança', 'Casa']
const allCategories     = ['Todos', 'Tecnologia', 'Saúde', 'Beleza', 'Casa', 'Culinária', 'Moda', 'Entretenimento', 'Segurança']

export default function SearchBar({ onSearch, onFilter, onRefresh, loading, activeCategory, mode = 'all' }: SearchBarProps) {
  const [query, setQuery] = useState('')

  const categories = mode === 'videos' ? videoCategories : mode === 'products' ? productCategories : allCategories

  // Pesquisa em tempo real com debounce leve
  useEffect(() => {
    const t = setTimeout(() => onSearch(query), 200)
    return () => clearTimeout(t)
  }, [query, onSearch])

  function clear() {
    setQuery('')
    onSearch('')
  }

  return (
    <div className="space-y-3">
      {/* Campo de busca */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar vídeos, produtos, marcas, hashtags..."
          className="w-full border rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all"
          style={{
            backgroundColor: 'var(--bg-input)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
          onFocus={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
        />
        {query && (
          <button onClick={clear} className="absolute right-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros de categoria + refresh */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto flex-1 pb-0.5" style={{ scrollbarWidth: 'none' }}>
          {categories.map(cat => {
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => onFilter(cat)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full transition-all font-medium border"
                style={isActive ? {
                  backgroundColor: 'var(--accent)',
                  color: '#fff',
                  borderColor: 'var(--accent)',
                } : {
                  backgroundColor: 'var(--bg-elevated)',
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border)',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          title="Atualizar dados"
          className="shrink-0 p-2.5 rounded-xl border transition-all disabled:opacity-50"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  )
}
