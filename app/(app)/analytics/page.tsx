import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Order } from '@/lib/types'
import AnalyticsClient from '@/components/analytics/AnalyticsClient'

export default async function AnalyticsPage() {
  let orders: Order[] = []

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
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .eq('restaurant_id', restaurant.id)
        .order('ordered_at', { ascending: true })
      orders = (data as Order[]) ?? []
    }
  } catch {}

  return <AnalyticsClient orders={orders} />
}
