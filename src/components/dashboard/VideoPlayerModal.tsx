'use client'

import { useState, useCallback } from 'react'
import { ViralVideo } from '@/types'
import {
  X, Heart, MessageCircle, Share2, Eye, ExternalLink,
  TrendingUp, Play, Clock, Loader2, AlertCircle,
} from 'lucide-react'

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}
import { SocialBadge, MarketplaceBadge } from '@/components/ui/PlatformBadge'

interface VideoPlayerModalProps {
  video: ViralVideo | null
  onClose: () => void
}

type PlayerState = 'idle' | 'loading' | 'playing' | 'error'

interface ResolvedEmbed {
  embedUrl: string
  videoUrl: string
  title: string
  channelName: string
  platform: 'youtube' | 'tiktok' | 'preview'
}

function fmt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return n.toString()
}

const platformLabel: Record<string, string> = {
  tiktok: 'TikTok', instagram: 'Instagram', facebook: 'Facebook',
  youtube: 'YouTube', reels: 'Instagram Reels', shorts: 'YouTube Shorts',
}

export default function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  const [playerState, setPlayerState] = useState<PlayerState>('idle')
  const [resolved, setResolved] = useState<ResolvedEmbed | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const platform = video ? (platformLabel[video.platform] ?? video.platform) : ''

  const handlePlay = useCallback(async () => {
    if (!video) return

    // 1. Se já temos o embed resolvido, só inicia
    if (resolved?.embedUrl) {
      setPlayerState('playing')
      return
    }

    // 2. Se o vídeo já tem embedUrl estático (hardcoded), usa direto
    if (video.embedUrl) {
      setResolved({
        embedUrl: video.embedUrl,
        videoUrl: video.videoUrl,
        title: video.title,
        channelName: video.author,
        platform: 'youtube',
      })
      setPlayerState('playing')
      return
    }

    // 3. Busca URL real no servidor
    setPlayerState('loading')
    setErrorMsg('')

    try {
      const params = new URLSearchParams({
        platform: video.platform,
        videoUrl: video.videoUrl,
        title: video.title,
        q: `${video.title} ${video.category}`,
      })

      const res = await fetch(`/api/videos?${params}`)
      const data = await res.json()

      if (data.embedUrl) {
        setResolved({
          embedUrl: data.embedUrl,
          videoUrl: data.videoUrl ?? video.videoUrl,
          title: data.title ?? video.title,
          channelName: data.channelName ?? video.author,
          platform: data.platform ?? 'youtube',
        })
        setPlayerState('playing')
      } else {
        // Sem embed disponível → abre externamente
        setErrorMsg(data.message ?? 'Vídeo não disponível para embed')
        setPlayerState('error')
      }
    } catch {
      setErrorMsg('Erro ao carregar vídeo. Verifique sua conexão.')
      setPlayerState('error')
    }
  }, [video, resolved])

  function handleClose() {
    setPlayerState('idle')
    setResolved(null)
    setErrorMsg('')
    onClose()
  }

  if (!video) return null

  const scoreColor = video.trendScore >= 97 ? '#10b981' : video.trendScore >= 90 ? '#f59e0b' : '#818cf8'
  const isYouTubeKey = !!process.env.NEXT_PUBLIC_HAS_YT_KEY

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ backgroundColor: 'rgba(0,0,0,0.80)' }}
        onClick={handleClose}
      />

      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden border flex flex-col lg:flex-row"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          maxHeight: '92vh',
        }}
      >
        {/* Fechar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full flex items-center justify-center border transition-all hover:opacity-70"
          style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}
        >
          <X className="w-4 h-4" style={{ color: 'var(--text-primary)' }} />
        </button>

        {/* ── Player ── */}
        <div
          className="relative bg-black shrink-0 lg:w-[52%] flex items-center justify-center"
          style={{ minHeight: '270px' }}
        >
          {/* ESTADO: PLAYING → iframe */}
          {playerState === 'playing' && resolved?.embedUrl && (
            <iframe
              src={resolved.embedUrl}
              title={resolved.title}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}

          {/* ESTADO: LOADING → spinner */}
          {playerState === 'loading' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black">
              <Loader2 className="w-10 h-10 text-white/60 animate-spin" />
              <p className="text-xs text-white/50 text-center px-4">
                Buscando vídeo real…
              </p>
            </div>
          )}

          {/* ESTADO: ERROR → aviso */}
          {playerState === 'error' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black px-6">
              <AlertCircle className="w-10 h-10 text-orange-400" />
              <p className="text-xs text-white/70 text-center">{errorMsg}</p>
              <a
                href={video.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold"
                style={{ background: 'linear-gradient(135deg,var(--accent),#ec4899)' }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Abrir no {platform}
              </a>
            </div>
          )}

          {/* ESTADO: IDLE → thumbnail + play */}
          {(playerState === 'idle') && (
            <>
              <img
                src={video.thumbnail}
                alt={video.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    `https://via.placeholder.com/600x400/6366f1/ffffff?text=${encodeURIComponent(video.title.slice(0, 20))}`
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25" />

              {/* badges topo */}
              <div className="absolute top-3 left-3 right-12 flex flex-wrap items-center gap-1.5">
                <SocialBadge platform={video.platform} size="md" />
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white">
                  <Clock className="w-2.5 h-2.5" /> {video.duration}
                </span>
              </div>

              {/* score */}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70">
                <TrendingUp className="w-3 h-3" style={{ color: scoreColor }} />
                <span className="text-[10px] font-bold" style={{ color: scoreColor }}>{video.trendScore}</span>
              </div>

              {/* Play central — BUTTON, não link */}
              <button
                onClick={handlePlay}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 focus:outline-none group/play"
              >
                <div className="w-16 h-16 rounded-full border-2 border-white/80 bg-white/15 backdrop-blur-sm flex items-center justify-center transition-all duration-200 group-hover/play:bg-white/30 group-hover/play:scale-110">
                  <Play className="w-7 h-7 text-white fill-white ml-1" />
                </div>
                <span className="text-xs text-white/70 font-medium">
                  {video.embedUrl
                    ? 'Clique para assistir'
                    : 'Buscar e reproduzir vídeo'}
                </span>
              </button>

              {/* stats */}
              <div className="absolute bottom-0 left-0 right-0 px-3 py-2.5 flex items-center gap-4">
                <span className="flex items-center gap-1 text-[10px] text-white/90"><Eye className="w-3 h-3" />{fmt(video.views)}</span>
                <span className="flex items-center gap-1 text-[10px] text-white/90"><Heart className="w-3 h-3" />{fmt(video.likes)}</span>
                <span className="flex items-center gap-1 text-[10px] text-white/90"><MessageCircle className="w-3 h-3" />{fmt(video.comments)}</span>
                <span className="flex items-center gap-1 text-[10px] text-white/90"><Share2 className="w-3 h-3" />{fmt(video.shares)}</span>
              </div>
            </>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="flex-1 flex flex-col overflow-y-auto p-5 gap-3" style={{ maxHeight: '92vh' }}>

          {/* Fonte do vídeo quando resolvido */}
          {playerState === 'playing' && resolved && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
              <YoutubeIcon className="w-4 h-4 shrink-0 text-red-500" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] truncate font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {resolved.title}
                </p>
                {resolved.channelName && (
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{resolved.channelName}</p>
                )}
              </div>
            </div>
          )}

          {/* Autor original */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg,var(--accent),#ec4899)' }}>
              {video.author.replace('@', '').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{video.author}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {new Date(video.postedAt).toLocaleDateString('pt-BR')} · {platform}
              </p>
            </div>
          </div>

          {/* Título */}
          <h2 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
            {video.title}
          </h2>

          {/* Categoria + hashtags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {video.category}
            </span>
            {video.hashtags.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full border"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Eye,           label: 'Visualizações',     value: fmt(video.views),    color: '#3b82f6' },
              { icon: Heart,         label: 'Curtidas',          value: fmt(video.likes),    color: '#ec4899' },
              { icon: MessageCircle, label: 'Comentários',       value: fmt(video.comments), color: '#10b981' },
              { icon: Share2,        label: 'Compartilhamentos', value: fmt(video.shares),   color: '#f59e0b' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2 p-2 rounded-xl border"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                <div>
                  <p className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{label}</p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Produto vinculado */}
          {video.linkedProduct && (
            <div>
              <p className="text-[9px] uppercase tracking-wide font-semibold mb-1.5" style={{ color: 'var(--text-muted)' }}>
                Produto neste vídeo
              </p>
              <a href={video.linkedProduct.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-[color:var(--accent)] group/prod"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)' }}>
                <MarketplaceBadge platform={video.linkedProduct.marketplace} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                    {video.linkedProduct.name}
                  </p>
                  <p className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                    R${video.linkedProduct.price.toFixed(2).replace('.', ',')}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 shrink-0 opacity-30 group-hover/prod:opacity-100"
                  style={{ color: 'var(--accent)' }} />
              </a>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-2 mt-auto pt-1">
            {playerState === 'playing' ? (
              <button
                onClick={() => { setPlayerState('idle'); setResolved(null) }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-semibold transition-all"
                style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                ↩ Voltar à prévia
              </button>
            ) : (
              <button
                onClick={handlePlay}
                disabled={playerState === 'loading'}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,var(--accent),#ec4899)' }}
              >
                {playerState === 'loading'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Buscando vídeo…</>
                  : <><Play className="w-4 h-4 fill-white" /> Reproduzir agora</>
                }
              </button>
            )}

            <a href={video.videoUrl} target="_blank" rel="noopener noreferrer"
              title={`Abrir no ${platform}`}
              className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all hover:border-[color:var(--accent)]"
              style={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Nota sobre API key */}
          {!video.embedUrl && (
            <p className="text-[9px] text-center leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {process.env.YOUTUBE_API_KEY
                ? `Busca YouTube ativa · ${platform} sem embed nativo`
                : `Configure YOUTUBE_API_KEY no .env.local para busca automática de vídeos`
              }
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
