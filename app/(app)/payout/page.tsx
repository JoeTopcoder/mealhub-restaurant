import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PayoutRequest } from '@/lib/types'
import PayoutClient from '@/components/payout/PayoutClient'

export default async function PayoutPage() {
  let balance = 0
  let restaurantId = ''
  let payouts: PayoutRequest[] = []
  let bankInfo = { bank_name: '', bank_account_number: '', bank_account_holder: '', bank_branch: '', bank_account_type: '' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/auth/login')

    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id, bank_name, bank_account_number, bank_account_holder, bank_branch, bank_account_type')
      .eq('owner_id', user.id)
      .single()

    if (restaurant) {
      restaurantId = restaurant.id
      bankInfo = {
        bank_name:           restaurant.bank_name ?? '',
        bank_account_number: restaurant.bank_account_number ?? '',
        bank_account_holder: restaurant.bank_account_holder ?? '',
        bank_branch:         restaurant.bank_branch ?? '',
        bank_account_type:   restaurant.bank_account_type ?? '',
      }

      const { data: balanceView } = await supabase
        .from('restaurant_balance_view')
        .select('available_balance')
        .eq('restaurant_id', restaurant.id)
        .single()
      balance = balanceView?.available_balance ?? 0

      const { data: p } = await supabase
        .from('payout_requests')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('created_at', { ascending: false })
      payouts = (p as PayoutRequest[]) ?? []
    }
  } catch {}

  return <PayoutClient balance={balance} restaurantId={restaurantId} payouts={payouts} bankInfo={bankInfo} />
}
