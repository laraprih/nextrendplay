'use client'

import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  color: 'purple' | 'blue' | 'green' | 'orange' | 'pink'
  trend?: number
}

const colorMap = {
  purple: { icon: 'text-purple-600 dark:text-purple-400', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300', border: 'border-purple-500/25', bg: 'bg-purple-500/10' },
  blue:   { icon: 'text-blue-600 dark:text-blue-400',     badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-300',       border: 'border-blue-500/25',   bg: 'bg-blue-500/10' },
  green:  { icon: 'text-emerald-600 dark:text-emerald-400', badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/25', bg: 'bg-emerald-500/10' },
  orange: { icon: 'text-orange-600 dark:text-orange-400', badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300', border: 'border-orange-500/25', bg: 'bg-orange-500/10' },
  pink:   { icon: 'text-pink-600 dark:text-pink-400',     badge: 'bg-pink-500/15 text-pink-700 dark:text-pink-300',       border: 'border-pink-500/25',   bg: 'bg-pink-500/10' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
  const c = colorMap[color]
  return (
    <div className={`rounded-2xl border ${c.border} p-5`}
      style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</p>
          <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
          {subtitle && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</p>}
        </div>
        <div className={`rounded-xl p-2.5 ${c.bg} border ${c.border}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>vs. semana anterior</span>
        </div>
      )}
    </div>
  )
}
