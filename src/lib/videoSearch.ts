/**
 * Busca URLs de embed reais para vídeos de diferentes plataformas.
 *
 * YouTube  → YouTube Data API v3 (requer YOUTUBE_API_KEY)
 * TikTok   → TikTok oEmbed público (não requer chave, mas precisa de URL com ID real)
 *           Fallback: YouTube search sobre o mesmo tema
 * Reels    → YouTube search sobre o mesmo tema (Instagram bloqueia embeds externos)
 * Shorts   → YouTube embed direto (mesma engine que YouTube)
 */

export interface ResolvedVideo {
  embedUrl: string
  videoUrl: string
  title: string
  thumbnail: string
  channelName: string
  platform: 'youtube' | 'tiktok' | 'preview'
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeQuery(raw: string): string {
  return raw
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')   // remove emojis suplementares
    .replace(/[☀-➿]/gu, '')           // remove símbolos/emojis básicos
    .replace(/&/g, ' ')                         // & quebra a query string
    .replace(/[^\w\sÀ-úÇç-]/g, ' ')            // remove outros especiais
    .replace(/\s{2,}/g, ' ')                    // colapsa espaços duplos
    .trim()
    .slice(0, 100)                              // YouTube aceita até ~100 chars
}

// ── YouTube Data API ─────────────────────────────────────────────────────────

export async function searchYouTube(
  query: string,
  maxResults = 1,
): Promise<ResolvedVideo | null> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return null

  try {
    const params = new URLSearchParams({
      key: apiKey,
      q: sanitizeQuery(query),
      type: 'video',
      part: 'id,snippet',
      maxResults: String(maxResults),
      relevanceLanguage: 'pt',
      regionCode: 'BR',
    })

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null

    const data = await res.json()
    const item = data.items?.[0]
    if (!item) return null

    const videoId = item.id?.videoId
    if (!videoId) return null

    return {
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      title: item.snippet?.title ?? query,
      thumbnail: item.snippet?.thumbnails?.high?.url ?? '',
      channelName: item.snippet?.channelTitle ?? '',
      platform: 'youtube',
    }
  } catch {
    return null
  }
}

// ── TikTok oEmbed ────────────────────────────────────────────────────────────
// Funciona para URLs reais de vídeos TikTok que contenham o video ID.
// Ex.: https://www.tiktok.com/@user/video/7123456789012345678

export async function resolveTikTokEmbed(
  tiktokUrl: string,
): Promise<{ embedUrl: string; videoId: string } | null> {
  // URL no formato https://www.tiktok.com/@.../video/VIDEOID
  const match = tiktokUrl.match(/\/video\/(\d+)/)
  if (!match) return null

  const videoId = match[1]

  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(tiktokUrl)}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return null

    // Se oEmbed retornou OK, o embed oficial funciona
    return {
      embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
      videoId,
    }
  } catch {
    // oEmbed falhou, mas o embed direto pode ainda funcionar
    return { embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`, videoId }
  }
}

// ── Resolver principal ───────────────────────────────────────────────────────

export async function resolveVideoEmbed(params: {
  platform: string
  videoUrl: string
  title: string
  searchQuery?: string
}): Promise<ResolvedVideo | null> {
  const { platform, videoUrl, title, searchQuery } = params
  const query = searchQuery ?? title

  // 1. YouTube / Shorts → embed direto se tiver ID, senão busca
  if (platform === 'youtube' || platform === 'shorts') {
    // Tenta extrair ID da URL existente
    const ytMatch = videoUrl.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/)
    if (ytMatch) {
      return {
        embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`,
        videoUrl: `https://www.youtube.com/watch?v=${ytMatch[1]}`,
        title,
        thumbnail: `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`,
        channelName: '',
        platform: 'youtube',
      }
    }
    // Sem ID → busca pelo título
    return searchYouTube(query)
  }

  // 2. TikTok → tenta oEmbed; se não tiver ID real, busca no YouTube
  if (platform === 'tiktok') {
    const tiktok = await resolveTikTokEmbed(videoUrl)
    if (tiktok) {
      return {
        embedUrl: tiktok.embedUrl,
        videoUrl,
        title,
        thumbnail: '',
        channelName: '',
        platform: 'tiktok',
      }
    }
    // Fallback: busca no YouTube com mesmo tema
    return searchYouTube(`${query} produto viral`)
  }

  // 3. Reels / Instagram → YouTube search (Instagram bloqueia embeds)
  if (platform === 'reels' || platform === 'instagram') {
    return searchYouTube(`${query} receita produto review`)
  }

  // 4. Qualquer outra → YouTube search
  return searchYouTube(query)
}
