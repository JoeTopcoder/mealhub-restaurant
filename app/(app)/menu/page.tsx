import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MenuItem } from '@/lib/types'
import MenuClient from '@/components/menu/MenuClient'

export default async function MenuPage() {
  let menuItems: MenuItem[] = []
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
        .from('menu_items')
        .select('*, sides:menu_item_sides(*)')
        .eq('restaurant_id', restaurant.id)
        .order('category')
        .order('name')
      menuItems = (data as MenuItem[]) ?? []
    }
  } catch {}

  return <MenuClient initialItems={menuItems} restaurantId={restaurantId} />
}
