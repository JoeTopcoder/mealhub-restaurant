'use client'

import { useMemo, useState } from 'react'
import { Order } from '@/lib/types'
import { TrendingUp, ShoppingBag, CheckCircle2, BarChart2 } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Period = 'today' | '7d' | '30d' | 'all'

export default function AnalyticsClient({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<Period>('7d')

  const filtered = useMemo(() => {
    const now = Date.now()
    const cut: Record<Period, number> = {
      today: Date.now() - 86_400_000,
      '7d':  Date.now() - 7  * 86_400_000,
      '30d': Date.now() - 30 * 86_400_000,
      all:   0,
    }
    return orders.filter(o => new Date(o.ordered_at).getTime() >= cut[period])
  }, [orders, period])

  const delivered  = filtered.filter(o => o.status === 'delivered')
  const cancelled  = filtered.filter(o => o.status === 'cancelled')
  const inProgress = filtered.filter(o => !['delivered', 'cancelled'].includes(o.status))

  const revenue   = delivered.reduce((s, o) => s + (o.total_amount ?? 0), 0)
  const avgOrder  = delivered.length > 0 ? revenue / delivered.length : 0
  const completion = filtered.length > 0 ? (delivered.length / filtered.length) * 100 : 0

  // Revenue chart — daily buckets
  const chartData = useMemo(() => {
    const days = period === 'today' ? 24 : period === '7d' ? 7 : period === '30d' ? 30 : 30
    const buckets: Record<string, number> = {}

    delivered.forEach(o => {
      const d = new Date(o.ordered_at)
      const key = period === 'today'
        ? `${d.getHours()}:00`
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      buckets[key] = (buckets[key] ?? 0) + (o.total_amount ?? 0)
    })

    return Object.entries(buckets).map(([label, value]) => ({ label, value: Math.round(value * 100) / 100 }))
  }, [delivered, period])

  // Top selling items
  const topItems = useMemo(() => {
    const counts: Record<string, number> = {}
    delivered.forEach(o => {
      ;(o.items ?? []).forEach(item => {
        counts[item.item_name] = (counts[item.item_name] ?? 0) + item.quantity
      })
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }))
  }, [delivered])

  const maxCount = topItems[0]?.count ?? 1

  const stats = [
    { label: 'Revenue', value: `$${revenue.toFixed(2)}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Orders', value: filtered.length, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Completion Rate', value: `${completion.toFixed(0)}%`, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Avg. Order Value', value: `$${avgOrder.toFixed(2)}`, icon: BarChart2, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track your restaurant performance</p>
        </div>
        {/* Period tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
          {([['today', 'Today'], ['7d', '7 Days'], ['30d', '30 Days'], ['all', 'All Time']] as [Period, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${period === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="font-bold text-gray-900 mb-4">Revenue Over Time</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']} labelClassName="font-semibold" />
              <Area type="monotone" dataKey="value" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center text-gray-300 text-sm">No data for this period</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Order Breakdown</h2>
          <div className="space-y-4">
            {[
              { label: 'Delivered', count: delivered.length, color: 'bg-green-500' },
              { label: 'In Progress', count: inProgress.length, color: 'bg-blue-500' },
              { label: 'Cancelled', count: cancelled.length, color: 'bg-red-400' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="font-bold text-gray-900">{count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${color} rounded-full transition-all`}
                    style={{ width: `${filtered.length > 0 ? (count / filtered.length) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top items */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Top Selling Items</h2>
          {topItems.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topItems.map(({ name, count }, i) => (
                <div key={name}>
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-bold text-gray-400 w-4 text-center">{i + 1}</span>
                      <span className="font-medium text-gray-700 truncate">{name}</span>
                    </div>
                    <span className="font-bold text-gray-900 flex-shrink-0 ml-2">{count}x</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden ml-6">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
