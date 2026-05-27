import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.ytimg.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'http2.mlstatic.com' },
      { protocol: 'https', hostname: '*.mlstatic.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            // Permite embeds do YouTube e TikTok no iframe
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.tiktok.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' https://www.youtube.com https://www.tiktok.com",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://www.tiktok.com",
              "connect-src 'self' https://www.googleapis.com https://api.mercadolibre.com https://graph.facebook.com",
              "font-src 'self' data:",
            ].join('; '),
          },
        ],
      },
    ]
  },
};

export default nextConfig;
