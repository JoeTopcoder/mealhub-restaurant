'use client'

import { useState } from 'react'
import { Restaurant } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Save, ToggleLeft, ToggleRight, Clock } from 'lucide-react'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS: Record<string, string> = {
  monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
  friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
}
const CUISINE_TYPES = [
  'American', 'Asian', 'Breakfast', 'Chinese', 'Coffee', 'Dessert',
  'Fast Food', 'Healthy', 'Indian', 'Italian', 'Japanese', 'Mediterranean',
  'Mexican', 'Pizza', 'Seafood', 'Sushi', 'Thai', 'Other',
]

const DEFAULT_HOURS = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: { is_open: day !== 'sunday', open: '08:00', close: '22:00' },
}), {} as Record<string, { is_open: boolean; open: string; close: string }>)

export default function SettingsClient({ restaurant }: { restaurant: Restaurant | null }) {
  const [form, setForm] = useState({
    name: restaurant?.name ?? '',
    description: restaurant?.description ?? '',
    phone: restaurant?.phone ?? '',
    address: restaurant?.address ?? '',
    cuisine_type: restaurant?.cuisine_type ?? CUISINE_TYPES[0],
    delivery_fee: restaurant?.delivery_fee?.toString() ?? '0',
    estimated_delivery_time: restaurant?.estimated_delivery_time?.toString() ?? '30',
    is_open: restaurant?.is_open ?? false,
  })
  const [hours, setHours] = useState<Record<string, { is_open: boolean; open: string; close: string }>>(
    restaurant?.operating_hours ?? DEFAULT_HOURS
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const supabase = createClient()

    if (!restaurant) {
      setError('No restaurant found. Please contact support.')
      setSaving(false)
      return
    }

    const { error: err } = await supabase
      .from('restaurants')
      .update({
        name: form.name,
        description: form.description || null,
        phone: form.phone || null,
        address: form.address || null,
        cuisine_type: form.cuisine_type || null,
        delivery_fee: parseFloat(form.delivery_fee) || 0,
        estimated_delivery_time: parseInt(form.estimated_delivery_time) || 30,
        is_open: form.is_open,
        operating_hours: hours,
      })
      .eq('id', restaurant.id)

    if (err) setError(err.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  const setDay = (day: string, field: string, value: string | boolean) =>
    setHours(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }))

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Restaurant Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your restaurant information and preferences</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-700 text-sm p-4 rounded-2xl border border-red-100">{error}</div>
        )}

        {/* Basic info */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Restaurant Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Restaurant Name *</label>
              <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                rows={3} placeholder="Tell customers about your restaurant…"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Phone Number</label>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+1 555-555-5555"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Cuisine Type</label>
              <select value={form.cuisine_type} onChange={e => setForm(p => ({ ...p, cuisine_type: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors">
                {CUISINE_TYPES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Address</label>
              <input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                placeholder="123 Main St, City, State"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
          </div>
        </div>

        {/* Delivery settings */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Delivery Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Delivery Fee ($)</label>
              <input type="number" min="0" step="0.50" value={form.delivery_fee} onChange={e => setForm(p => ({ ...p, delivery_fee: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">Est. Delivery Time (min)</label>
              <input type="number" min="5" max="120" value={form.estimated_delivery_time} onChange={e => setForm(p => ({ ...p, estimated_delivery_time: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4">
            <div>
              <p className="text-sm font-bold text-gray-800">Restaurant Status</p>
              <p className="text-xs text-gray-500 mt-0.5">Toggle to open or close for orders right now</p>
            </div>
            <button type="button" onClick={() => setForm(p => ({ ...p, is_open: !p.is_open }))} className="flex-shrink-0">
              {form.is_open
                ? <ToggleRight className="w-10 h-10 text-green-500" />
                : <ToggleLeft className="w-10 h-10 text-gray-300" />}
            </button>
          </div>
        </div>

        {/* Operating hours */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-purple-600" />
            <h2 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Operating Hours</h2>
          </div>

          <div className="space-y-3">
            {DAYS.map(day => (
              <div key={day} className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${hours[day]?.is_open ? 'bg-gray-50' : 'bg-gray-50 opacity-60'}`}>
                <button type="button" onClick={() => setDay(day, 'is_open', !hours[day]?.is_open)} className="flex-shrink-0">
                  {hours[day]?.is_open
                    ? <ToggleRight className="w-6 h-6 text-green-500" />
                    : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                </button>
                <span className="w-10 text-sm font-bold text-gray-600">{DAY_LABELS[day]}</span>
                {hours[day]?.is_open ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input type="time" value={hours[day]?.open ?? '08:00'} onChange={e => setDay(day, 'open', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="time" value={hours[day]?.close ?? '22:00'} onChange={e => setDay(day, 'close', e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 italic">Closed</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-700 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-60">
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span className="text-green-600 text-sm font-semibold">✓ Saved successfully</span>}
        </div>
      </form>
    </div>
  )
}
