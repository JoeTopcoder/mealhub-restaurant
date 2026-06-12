import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: ReactNode }) {
  let restaurantName: string | undefined
  let restaurantImage: string | undefined

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('name, image_url')
      .eq('owner_id', user.id)
      .single()

    restaurantName = restaurant?.name
    restaurantImage = restaurant?.image_url ?? undefined
  } catch {
    // Supabase unavailable — still render layout
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar restaurantName={restaurantName} restaurantImage={restaurantImage} />
      <main className="flex-1 lg:ml-60 min-w-0">
        {children}
      </main>
    </div>
  )
}
