import { NextRequest, NextResponse } from 'next/server'
import { resolveVideoEmbed } from '@/lib/videoSearch'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const platform    = searchParams.get('platform') ?? 'youtube'
  const videoUrl    = searchParams.get('videoUrl') ?? ''
  const title       = searchParams.get('title') ?? ''
  const searchQuery = searchParams.get('q') ?? title

  if (!title && !searchQuery) {
    return NextResponse.json({ error: 'Parâmetro title ou q obrigatório' }, { status: 400 })
  }

  try {
    const result = await resolveVideoEmbed({ platform, videoUrl, title, searchQuery })

    if (!result) {
      return NextResponse.json({ embedUrl: null, message: 'Nenhum vídeo encontrado' })
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[/api/videos]', err)
    return NextResponse.json({ embedUrl: null, message: 'Erro ao buscar vídeo' }, { status: 500 })
  }
}
