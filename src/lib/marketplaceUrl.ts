import { MarketplacePlatform } from '@/types'

/**
 * Gera URL de busca real para cada marketplace com base no nome do produto.
 * O usuário é levado direto à página de resultados do produto — não à homepage.
 */
export function buildMarketplaceUrl(platform: MarketplacePlatform, productName: string): string {
  const q = encodeURIComponent(productName)

  switch (platform) {
    case 'shopee':
      return `https://shopee.com.br/search?keyword=${q}`
    case 'amazon':
      return `https://www.amazon.com.br/s?k=${q}`
    case 'mercadolivre':
      return `https://lista.mercadolivre.com.br/${encodeURIComponent(productName.replace(/\s+/g, '-').toLowerCase())}`
    case 'magalu':
      return `https://www.magazineluiza.com.br/busca/${encodeURIComponent(productName.replace(/\s+/g, '%20'))}/`
    case 'americanas':
      return `https://www.americanas.com.br/busca/${q}`
    case 'shein':
      return `https://www.shein.com.br/search?q=${q}`
    case 'aliexpress':
      return `https://www.aliexpress.com/wholesale?SearchText=${q}`
    case 'tiktokshop':
      return `https://www.tiktok.com/search?q=${q}&source=H5_m`
    case 'shopify':
      return `https://www.google.com/search?q=${q}+site:myshopify.com`
    default:
      return `https://www.google.com/search?q=${q}+comprar`
  }
}
