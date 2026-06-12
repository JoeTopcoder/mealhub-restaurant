import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata: Metadata = {
  title: 'MealHub — Restaurant Portal',
  description: 'Manage your restaurant on MealHub',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full antialiased bg-gray-50">{children}</body>
    </html>
  )
}
