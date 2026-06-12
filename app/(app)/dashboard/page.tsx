import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Order, Restaurant, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/types'
import StatusToggle from '@/components/dashboard/StatusToggle'
import {
  ShoppingBag, TrendingUp, Clock, CheckCircle2,
  ChevronRight, AlertCircle, UtensilsCrossed,
} from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  let restaurant: Restaurant | null = null
  let orders: Order[] = []
  let totalRevenue = 0
  let userId = ''

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')
    userId = user.id

    const { data: r } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single()
    restaurant = r

    if (restaurant) {
      const { data: o } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('restaurant_id', restaurant.id)
        .order('ordered_at', { ascending: false })
        .limit(50)
      orders = (o as Order[]) ?? []
      totalRevenue = orders
        .filter(o => o.status === 'delivered')
        .reduce((s, o) => s + (o.total_amount ?? 0), 0)
    }
  } catch {
    // Supabase unavailable
  }

  if (!restaurant) {
    return (
      <div className="p-6 lg:p-10">
        <div className="max-w-lg mx-auto mt-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-12">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-10 h-10 text-purple-600" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Set up your restaurant</h2>
          <p className="text-gray-500 text-sm mb-8">Register your restaurant to start receiving orders on MealHub.</p>
          <Link href="/settings"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all">
            Get Started →
          </Link>
        </div>
      </div>
    )
  }

  const pendingOrders = orders.filter(o => o.status === 'pending')
  const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'confirmed')
  const deliveredOrders = orders.filter(o => o.status === 'delivered')
  const recentOrders = orders.slice(0, 8)

  const stats = [
    {
      label: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      change: `${deliveredOrders.length} delivered`,
    },
    {
      label: 'New Orders',
      value: pendingOrders.length,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      change: 'awaiting action',
      urgent: pendingOrders.length > 0,
    },
    {
      label: 'Preparing',
      value: preparingOrders.length,
      icon: UtensilsCrossed,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: 'in kitchen',
    },
    {
      label: 'Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      change: 'from completed orders',
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">{restaurant.name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {restaurant.cuisine_type && <span className="mr-2">{restaurant.cuisine_type} ·</span>}
            {restaurant.address ?? 'No address set'}
          </p>
        </div>
        <StatusToggle restaurantId={restaurant.id} initialOpen={restaurant.is_open} />
      </div>

      {/* Verification banner */}
      {!restaurant.is_verified && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Verification pending</p>
            <p className="text-xs text-amber-600 mt-0.5">Your restaurant is under review. You can still set up your menu and settings while waiting.</p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className={`bg-white rounded-2xl border p-5 shadow-sm ${stat.urgent ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} style={{ width: 18, height: 18 }} />
              </div>
              {stat.urgent && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-dot" />
                </span>
              )}
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {[
          { href: '/orders', label: 'Orders', emoji: '📦' },
          { href: '/menu', label: 'Menu', emoji: '🍽️' },
          { href: '/analytics', label: 'Analytics', emoji: '📊' },
          { href: '/loyalty', label: 'Loyalty', emoji: '💜' },
          { href: '/payout', label: 'Payouts', emoji: '💳' },
          { href: '/settings', label: 'Settings', emoji: '⚙️' },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-purple-200 hover:shadow-md hover:-translate-y-0.5 transition-all">
            <span className="text-2xl">{item.emoji}</span>
            <span className="text-xs font-semibold text-gray-700">{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link href="/orders" className="text-sm text-purple-600 font-semibold hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-16 text-center">
            <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 text-sm font-medium">No orders yet</p>
            <p className="text-gray-300 text-xs mt-1">Orders will appear here once customers start ordering</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <Link key={order.id} href={`/orders?id=${order.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      Order #{order.restaurant_order_number ?? order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''} ·{' '}
                      {order.is_pickup ? 'Pickup' : 'Delivery'} ·{' '}
                      {new Date(order.ordered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ORDER_STATUS_COLOR[order.status]}`}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                  <span className="text-sm font-bold text-gray-900">${order.total_amount?.toFixed(2)}</span>
                  <CheckCircle2 className="w-4 h-4 text-gray-200" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
