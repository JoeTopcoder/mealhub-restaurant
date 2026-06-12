import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: '7Dash — Restaurant Portal',
  description: 'Manage your restaurant on 7Dash',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-gray-50">{children}</body>
    </html>
  )
}
