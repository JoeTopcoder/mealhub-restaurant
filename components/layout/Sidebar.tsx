'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, BarChart3,
  Settings, Heart, Wallet, LogOut, X, Menu,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/orders',     label: 'Orders',      icon: ShoppingBag },
  { href: '/menu',       label: 'Menu',        icon: UtensilsCrossed },
  { href: '/analytics',  label: 'Analytics',   icon: BarChart3 },
  { href: '/loyalty',    label: 'Loyalty',     icon: Heart },
  { href: '/payout',     label: 'Payouts',     icon: Wallet },
  { href: '/settings',   label: 'Settings',    icon: Settings },
]

interface SidebarProps {
  restaurantName?: string
  restaurantImage?: string
}

export default function Sidebar({ restaurantName, restaurantImage }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              active
                ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
            {label}
          </Link>
        )
      })}
    </nav>
  )

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="7Dash" width={36} height={36} className="rounded-xl flex-shrink-0" />
          <div>
            <p className="text-base font-extrabold text-gray-900 leading-tight">7Dash</p>
            <p className="text-xs text-gray-400 leading-tight">Restaurant Portal</p>
          </div>
        </Link>
      </div>

      {/* Restaurant identity */}
      {restaurantName && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center flex-shrink-0">
              {restaurantImage ? (
                <img src={restaurantImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">🍽️</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{restaurantName}</p>
              <p className="text-xs text-gray-400">Owner Dashboard</p>
            </div>
          </div>
        </div>
      )}

      <NavLinks />

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 fixed inset-y-0 left-0 z-30">
        <SidebarInner />
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14 shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/logo.png" alt="7Dash" width={32} height={32} className="rounded-lg" />
          <span className="font-extrabold text-base text-gray-900">7Dash</span>
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 rounded-xl hover:bg-gray-100">
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
              <span className="font-extrabold text-base text-gray-900">7Dash</span>
              <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarInner />
          </aside>
        </>
      )}
    </>
  )
}
