import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Order } from '@/lib/types'
import OrdersClient from '@/components/orders/OrdersClient'

export default async function OrdersPage() {
  let orders: Order[] = []
  let restaurantId = ''

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
      restaurantId = restaurant.id
      const { data } = await supabase
        .from('orders')
        .select('*, items:order_items(*), user:users(name, phone)')
        .eq('restaurant_id', restaurant.id)
        .order('ordered_at', { ascending: false })
        .limit(200)
      orders = (data as Order[]) ?? []
    }
  } catch {}

  return <OrdersClient initialOrders={orders} restaurantId={restaurantId} />
}
