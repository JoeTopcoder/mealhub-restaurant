'use client'

import { useState } from 'react'
import { PayoutRequest } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Wallet, Building2, Send, Save, CheckCircle2, Clock, XCircle } from 'lucide-react'

const STATUS_STYLE: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  approved:   'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  completed:  'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-600',
}

export default function PayoutClient({
  balance, restaurantId, payouts: initialPayouts, bankInfo: initialBank,
}: {
  balance: number
  restaurantId: string
  payouts: PayoutRequest[]
  bankInfo: { bank_name: string; bank_account_number: string; bank_account_holder: string; bank_branch: string; bank_account_type: string }
}) {
  const [payouts, setPayouts] = useState(initialPayouts)
  const [bank, setBank] = useState(initialBank)
  const [requestAmount, setRequestAmount] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [savingBank, setSavingBank] = useState(false)
  const [bankSaved, setBankSaved] = useState(false)
  const [msg, setMsg] = useState('')

  async function requestPayout(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(requestAmount)
    if (!amount || amount <= 0 || amount > balance) {
      setMsg('Invalid amount'); return
    }
    setRequesting(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('payout_requests')
      .insert({
        restaurant_id: restaurantId,
        amount,
        status: 'pending',
        type: 'restaurant',
        bank_name:    bank.bank_name || null,
        bank_account: bank.bank_account_number || null,
        account_holder: bank.bank_account_holder || null,
      })
      .select()
      .single()
    if (error) { setMsg(error.message) }
    else { setPayouts(p => [data, ...p]); setRequestAmount(''); setMsg('Payout request submitted!') }
    setRequesting(false)
  }

  async function saveBank(e: React.FormEvent) {
    e.preventDefault()
    setSavingBank(true)
    const supabase = createClient()
    await supabase.from('restaurants').update({
      bank_name:           bank.bank_name || null,
      bank_account_number: bank.bank_account_number || null,
      bank_account_holder: bank.bank_account_holder || null,
      bank_branch:         bank.bank_branch || null,
      bank_account_type:   bank.bank_account_type || null,
    }).eq('id', restaurantId)
    setBankSaved(true)
    setTimeout(() => setBankSaved(false), 3000)
    setSavingBank(false)
  }

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle2 className="w-4 h-4 text-green-500" />
    if (status === 'rejected')  return <XCircle className="w-4 h-4 text-red-400" />
    return <Clock className="w-4 h-4 text-yellow-500" />
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Payouts</h1>
        <p className="text-sm text-gray-500 mt-0.5">Request your earnings and manage bank details</p>
      </div>

      {/* Balance card */}
      <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-3xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-purple-200 text-sm font-medium mb-1">Available Balance</p>
            <p className="text-4xl font-extrabold">${balance.toFixed(2)}</p>
            <p className="text-purple-300 text-xs mt-1">After platform commission</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Request form inline */}
        <form onSubmit={requestPayout} className="mt-6 flex gap-3">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 text-sm">$</span>
            <input
              type="number" step="0.01" min="1" max={balance}
              value={requestAmount} onChange={e => setRequestAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-7 pr-4 py-3 bg-white/20 border border-white/30 text-white placeholder:text-white/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
            />
          </div>
          <button type="submit" disabled={requesting || balance <= 0}
            className="flex items-center gap-2 px-5 py-3 bg-white text-purple-700 rounded-2xl font-bold text-sm hover:bg-purple-50 disabled:opacity-50 transition-colors shadow-md flex-shrink-0">
            <Send className="w-4 h-4" />
            {requesting ? 'Requesting…' : 'Request'}
          </button>
        </form>
        {msg && <p className="text-white/80 text-xs mt-2">{msg}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank details */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-purple-600" />
            <h2 className="font-bold text-gray-900">Bank Details</h2>
          </div>
          <form onSubmit={saveBank} className="space-y-3">
            {[
              { key: 'bank_name', label: 'Bank Name', placeholder: 'e.g. Chase Bank' },
              { key: 'bank_branch', label: 'Branch', placeholder: 'Branch name or number' },
              { key: 'bank_account_holder', label: 'Account Holder', placeholder: 'Full name on account' },
              { key: 'bank_account_number', label: 'Account Number', placeholder: '••••••••' },
              { key: 'bank_account_type', label: 'Account Type', placeholder: 'Checking / Savings' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-500 mb-1">{label}</label>
                <input
                  value={bank[key as keyof typeof bank]}
                  onChange={e => setBank(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-50 focus:bg-white"
                />
              </div>
            ))}
            <div className="flex items-center gap-3 pt-1">
              <button type="submit" disabled={savingBank}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-60 shadow-sm transition-all">
                <Save className="w-3.5 h-3.5" />
                {savingBank ? 'Saving…' : 'Save Bank Info'}
              </button>
              {bankSaved && <span className="text-green-600 text-xs font-semibold">✓ Saved</span>}
            </div>
          </form>
        </div>

        {/* Payout history */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Payout History</h2>
          </div>
          {payouts.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">No payout requests yet</div>
          ) : (
            <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
              {payouts.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    {statusIcon(p.status)}
                    <div>
                      <p className="text-sm font-bold text-gray-900">${p.amount.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_STYLE[p.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
