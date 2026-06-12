import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/Sidebar'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: restaurant } = await supabase
    .from('restaurants')
    .select('name, image_url, status, is_verified')
    .eq('owner_id', user.id)
    .single()

  // Block dashboard access until admin approves
  if (!restaurant || (!restaurant.is_verified && restaurant.status !== 'approved')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-5">
        <div className="w-full max-w-md text-center bg-white rounded-3xl border border-gray-100 shadow-lg p-12">
          <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application Under Review</h2>
          <p className="text-gray-500 text-sm mb-3">
            Your restaurant application is being reviewed by our team.
          </p>
          <p className="text-gray-400 text-xs leading-relaxed mb-8">
            You will receive an email once approved. This typically takes up to 48 hours.
          </p>
          <p className="text-xs text-gray-300">
            Status: <span className="font-semibold capitalize text-yellow-500">{restaurant?.status ?? 'pending'}</span>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar restaurantName={restaurant.name} restaurantImage={restaurant.image_url ?? undefined} />
      <main className="flex-1 lg:ml-60 min-w-0">
        {children}
      </main>
    </div>
  )
}
