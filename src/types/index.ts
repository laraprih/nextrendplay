export type MarketplacePlatform =
  | 'shopee' | 'amazon' | 'mercadolivre' | 'magalu' | 'americanas' | 'shein' | 'aliexpress' | 'tiktokshop' | 'shopify' | 'outro'

export type SocialPlatform =
  | 'instagram' | 'tiktok' | 'facebook' | 'youtube' | 'reels' | 'shorts'

export type ContentType = 'video' | 'product' | 'ad'

export interface MarketplaceInfo {
  platform: MarketplacePlatform
  url: string
  price?: number
  originalPrice?: number
  rating?: number
  soldCount?: number
  seller?: string
}

export interface ViralVideo {
  id: string
  title: string
  thumbnail: string
  videoUrl: string
  embedUrl?: string          // iframe src — disponível para YouTube/Shorts
  platform: SocialPlatform
  views: number
  likes: number
  comments: number
  shares: number
  duration: string
  author: string
  authorAvatar?: string
  category: string
  hashtags: string[]
  postedAt: string
  trendScore: number
  linkedProduct?: {
    name: string
    marketplace: MarketplacePlatform
    url: string
    price: number
  }
}

export interface TrendingProduct {
  id: string
  name: string
  category: string
  thumbnail: string
  videoUrl?: string
  engagementScore: number
  impressionsMin: number
  impressionsMax: number
  spendMin: number
  spendMax: number
  adsCount: number
  platforms: SocialPlatform[]
  marketplaces: MarketplaceInfo[]
  startDate: string
  pageName: string
  pageId: string
  country: string
  trend: 'up' | 'down' | 'stable'
  trendPercent: number
  type: ContentType
  description?: string
  hashtags?: string[]
}

export interface DashboardStats {
  totalAds: number
  totalProducts: number
  totalVideos: number
  avgEngagement: number
  topPlatform: string
  topMarketplace: string
  totalSpendMin: number
  totalSpendMax: number
  totalImpressionsMin: number
  totalImpressionsMax: number
}

export interface ChartDataPoint {
  name: string
  value: number
  secondary?: number
}
