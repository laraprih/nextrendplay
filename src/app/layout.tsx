import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'NexTrended – Meta Ads Intelligence',
  description: 'Descubra produtos e vídeos virais no Instagram com dados da Meta Ad Library',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: 'var(--bg-base)' }} suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
