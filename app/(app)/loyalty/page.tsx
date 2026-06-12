import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Heart, Users, Repeat, Star, TrendingUp } from 'lucide-react'

export default async function LoyaltyPage() {
  const stats = { total: 0, repeat: 0, members: 0, earned: 0, redeemed: 0 }
  const tiers = { platinum: 0, gold: 0, silver: 0, bronze: 0 }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let transactions: any[] = []

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (restaurant) {
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id')
        .eq('restaurant_id', restaurant.id)
        .eq('status', 'delivered')

      if (orders) {
        const userIds = [...new Set(orders.map(o => o.user_id))]
        stats.total = userIds.length

        const orderCounts = orders.reduce<Record<string, number>>((acc, o) => {
          acc[o.user_id] = (acc[o.user_id] ?? 0) + 1; return acc
        }, {})
        stats.repeat = Object.values(orderCounts).filter(c => c > 1).length

        if (userIds.length > 0) {
          const { data: accounts } = await supabase
            .from('loyalty_accounts')
            .select('tier, total_earned, total_redeemed')
            .in('user_id', userIds.slice(0, 100))

          if (accounts) {
            stats.members = accounts.length
            stats.earned   = accounts.reduce((s, a) => s + (a.total_earned ?? 0), 0)
            stats.redeemed = accounts.reduce((s, a) => s + (a.total_redeemed ?? 0), 0)
            accounts.forEach(a => {
              if (a.tier in tiers) tiers[a.tier as keyof typeof tiers]++
            })
          }

          const { data: txs } = await supabase
            .from('loyalty_transactions')
            .select('*, user:users(name)')
            .in('user_id', userIds.slice(0, 50))
            .order('created_at', { ascending: false })
            .limit(20)
          transactions = txs ?? []
        }
      }
    }
  } catch {}

  const totalTierMembers = Object.values(tiers).reduce((s, v) => s + v, 0)

  const TIER_CONFIG = [
    { key: 'platinum', label: 'Platinum', color: 'bg-purple-500', light: 'bg-purple-50 text-purple-700', emoji: '💎' },
    { key: 'gold',     label: 'Gold',     color: 'bg-yellow-400', light: 'bg-yellow-50 text-yellow-700', emoji: '🥇' },
    { key: 'silver',   label: 'Silver',   color: 'bg-gray-400',   light: 'bg-gray-50 text-gray-600',     emoji: '🥈' },
    { key: 'bronze',   label: 'Bronze',   color: 'bg-orange-400', light: 'bg-orange-50 text-orange-700', emoji: '🥉' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
          <Heart className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Loyalty & Retention</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track customer loyalty and rewards activity</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Customers', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Repeat Customers', value: `${stats.repeat} (${stats.total > 0 ? Math.round((stats.repeat / stats.total) * 100) : 0}%)`, icon: Repeat, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Loyalty Members', value: `${stats.members} (${stats.total > 0 ? Math.round((stats.members / stats.total) * 100) : 0}%)`, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Points Activity', value: `${stats.earned} earned`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-4.5 h-4.5 ${s.color}`} style={{ width: 18, height: 18 }} />
            </div>
            <p className="text-xl font-extrabold text-gray-900 leading-tight">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tier breakdown */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Loyalty Tier Breakdown</h2>
          {totalTierMembers === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No loyalty members yet</p>
          ) : (
            <div className="space-y-4">
              {TIER_CONFIG.map(({ key, label, color, light, emoji }) => {
                const count = tiers[key as keyof typeof tiers]
                const pct = totalTierMembers > 0 ? Math.round((count / totalTierMembers) * 100) : 0
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span>{emoji}</span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${light}`}>{label}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-900">{count} <span className="text-gray-400 font-normal text-xs">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-3xl p-6 text-white">
          <h2 className="font-bold mb-4">How 7Dash Loyalty Works</h2>
          <div className="space-y-3">
            {[
              { icon: '🎯', text: 'Customers earn 1 point per $1 spent' },
              { icon: '🔄', text: '100 points = $1 off their next order' },
              { icon: '⚡', text: 'Higher tiers earn points faster' },
              { icon: '📈', text: 'Loyalty members order 2.3× more often' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-3">
                <span className="text-xl">{icon}</span>
                <p className="text-sm text-purple-100">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Loyalty Activity</h2>
        </div>
        {transactions.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No loyalty transactions yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx, i) => (
              <div key={i} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{tx.user?.name ?? 'Customer'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tx.transaction_type === 'earn' ? 'Points earned' : 'Points redeemed'} ·{' '}
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-bold ${tx.transaction_type === 'earn' ? 'text-green-600' : 'text-purple-600'}`}>
                  {tx.transaction_type === 'earn' ? '+' : '-'}{tx.points} pts
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
