import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'orenoquiz',
  description: 'quiz application for party',
  applicationName: 'orenoquiz',
  manifest: '/manifest.json',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'icon', url: '/image/logo.png', sizes: '192x192' },
  ],
  themeColor: '#000000',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

type RootLayoutProps = {
  children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="ja-JP" dir="ltr">
      <body className="bg-neutral-200" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

export default RootLayout
