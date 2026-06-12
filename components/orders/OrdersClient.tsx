'use client'

import { useState, useCallback } from 'react'
import { Order, OrderStatus, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  Clock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Package, Bike, MapPin, StickyNote, RefreshCw, Phone,
} from 'lucide-react'

const TABS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: 'new',       label: 'New',       statuses: ['pending'] },
  { key: 'active',    label: 'Active',    statuses: ['confirmed', 'preparing', 'ready'] },
  { key: 'completed', label: 'Completed', statuses: ['delivered', 'picked_up'] },
  { key: 'cancelled', label: 'Cancelled', statuses: ['cancelled'] },
  { key: 'all',       label: 'All',       statuses: [] },
]

export default function OrdersClient({ initialOrders, restaurantId }: { initialOrders: Order[]; restaurantId: string }) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [tab, setTab] = useState('new')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [pickupCode, setPickupCode] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const currentTab = TABS.find(t => t.key === tab)!
  const filtered = currentTab.statuses.length > 0
    ? orders.filter(o => currentTab.statuses.includes(o.status))
    : orders

  async function refresh() {
    setRefreshing(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('orders')
      .select('*, items:order_items(*), user:users(name, phone)')
      .eq('restaurant_id', restaurantId)
      .order('ordered_at', { ascending: false })
      .limit(200)
    if (data) setOrders(data as Order[])
    setRefreshing(false)
  }

  const updateStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    setActionLoading(orderId + status)
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
    setActionLoading(null)
  }, [])

  const setCode = useCallback(async (orderId: string, code: string) => {
    if (code.length !== 4) return
    setActionLoading(orderId + 'code')
    const supabase = createClient()
    await supabase.from('orders').update({ pickup_code: code }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, pickup_code: code } : o))
    setPickupCode('')
    setActionLoading(null)
  }, [])

  const tabCount = (t: typeof TABS[0]) =>
    t.statuses.length > 0 ? orders.filter(o => t.statuses.includes(o.status)).length : orders.length

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{orders.length} total orders</p>
        </div>
        <button onClick={refresh} disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl mb-6 overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t.label}
            {tabCount(t) > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                t.key === 'new' && tabCount(t) > 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
              }`}>{tabCount(t)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 py-20 text-center shadow-sm">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-medium text-sm">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const isExpanded = expanded === order.id
            const loading = actionLoading?.startsWith(order.id)

            return (
              <div key={order.id} className={`bg-white rounded-3xl border shadow-sm overflow-hidden transition-all ${
                order.status === 'pending' ? 'border-orange-200 ring-2 ring-orange-100' : 'border-gray-100'
              }`}>
                {/* Order header */}
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-gray-900">
                          #{order.restaurant_order_number ?? order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[order.status]}`}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                        {order.is_pickup && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Pickup</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(order.ordered_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span>{order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}</span>
                        {order.user && 'name' in (order.user as object) && (
                          <span>{(order.user as { name?: string }).name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-base font-extrabold text-gray-900">${order.total_amount?.toFixed(2)}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                    {/* Items */}
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Items</p>
                      <div className="space-y-1.5">
                        {(order.items ?? []).map(item => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">
                              <span className="font-bold text-gray-900 mr-2">{item.quantity}×</span>
                              {item.item_name}
                            </span>
                            <span className="text-gray-600 font-semibold">${item.subtotal?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-dashed border-gray-200 mt-3 pt-3 flex justify-between text-sm font-bold">
                        <span className="text-gray-700">Total</span>
                        <span className="text-gray-900">${order.total_amount?.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Delivery info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {order.delivery_address && (
                        <div className="flex items-start gap-2 bg-gray-50 rounded-xl p-3">
                          <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-gray-500 mb-0.5">Delivery Address</p>
                            <p className="text-xs text-gray-700">{order.delivery_address}</p>
                          </div>
                        </div>
                      )}
                      {order.notes && (
                        <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
                          <StickyNote className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-amber-700 mb-0.5">Special Notes</p>
                            <p className="text-xs text-amber-600">{order.notes}</p>
                          </div>
                        </div>
                      )}
                      {order.user && 'phone' in (order.user as object) && (order.user as { phone?: string }).phone && (
                        <div className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                          <Phone className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-blue-700 mb-0.5">Customer Phone</p>
                            <p className="text-xs text-blue-600">{(order.user as { phone?: string }).phone}</p>
                          </div>
                        </div>
                      )}
                      {order.is_pickup && order.pickup_code && (
                        <div className="flex items-start gap-2 bg-green-50 rounded-xl p-3">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-green-700 mb-0.5">Pickup Code</p>
                            <p className="text-lg font-extrabold text-green-700 tracking-widest">{order.pickup_code}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Pickup code setter */}
                    {order.is_pickup && order.status === 'ready' && !order.pickup_code && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-xs font-bold text-blue-700 mb-2">Set Pickup Code</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            maxLength={4}
                            value={pickupCode}
                            onChange={e => setPickupCode(e.target.value.replace(/\D/, ''))}
                            placeholder="4-digit code"
                            className="flex-1 px-3 py-2 border border-blue-200 rounded-xl text-sm text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <button onClick={() => setCode(order.id, pickupCode)}
                            disabled={pickupCode.length !== 4 || !!actionLoading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                            Set
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(order.id, 'preparing')} disabled={!!loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm">
                            <CheckCircle2 className="w-4 h-4" /> Accept Order
                          </button>
                          <button onClick={() => updateStatus(order.id, 'cancelled')} disabled={!!loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-bold hover:bg-red-100 disabled:opacity-50 transition-colors">
                            <XCircle className="w-4 h-4" /> Reject
                          </button>
                        </>
                      )}
                      {(order.status === 'confirmed' || order.status === 'preparing') && (
                        <button onClick={() => updateStatus(order.id, 'ready')} disabled={!!loading}
                          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
                          <Bike className="w-4 h-4" /> Mark Ready for Pickup
                        </button>
                      )}
                      {order.status === 'ready' && !order.is_pickup && (
                        <button onClick={() => updateStatus(order.id, 'delivered')} disabled={!!loading}
                          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors shadow-sm">
                          <CheckCircle2 className="w-4 h-4" /> Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
