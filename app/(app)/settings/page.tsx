import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Restaurant } from '@/lib/types'
import SettingsClient from '@/components/settings/SettingsClient'

export default async function SettingsPage() {
  let restaurant: Restaurant | null = null

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .eq('owner_id', user.id)
      .single()
    restaurant = data
  } catch {}

  return <SettingsClient restaurant={restaurant} />
}
