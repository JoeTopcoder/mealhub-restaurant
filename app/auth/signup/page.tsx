'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChefHat, Mail, Lock, User, Eye, EyeOff, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [restaurantName, setRestaurantName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: 'restaurant_owner' } },
    })

    if (authErr) { setError(authErr.message); setLoading(false); return }

    if (data.user) {
      // Create user profile
      await supabase.from('users').upsert({
        id: data.user.id, email, name, role: 'restaurant_owner',
      }, { onConflict: 'id' })

      // Create initial restaurant record
      if (restaurantName) {
        await supabase.from('restaurants').insert({
          owner_id: data.user.id,
          name: restaurantName,
          status: 'draft',
          is_open: false,
          is_verified: false,
          onboarding_step: 0,
          store_type: 'food',
        })
      }
    }

    if (data.session) {
      router.push('/dashboard')
      router.refresh()
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-md text-center bg-white rounded-3xl border border-gray-100 shadow-sm p-12">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your restaurant account.
          </p>
          <Link href="/auth/login" className="inline-block text-sm font-semibold text-purple-600 hover:underline">
            ← Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800 p-12">
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">MealHub</p>
              <p className="text-purple-300 text-xs">Restaurant Portal</p>
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-snug mb-4">
            Grow your restaurant<br />with MealHub.
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed">
            Join hundreds of restaurants already using MealHub to reach more customers and increase revenue.
          </p>
        </div>
        <div className="bg-white/10 rounded-2xl p-6 text-white">
          <p className="text-2xl font-extrabold mb-1">0%</p>
          <p className="text-sm text-purple-200 mb-4">commission for your first 14 days</p>
          <p className="text-xs text-purple-300 leading-relaxed">Then just 10–15% — half of what competitors charge. No contracts, no hidden fees.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-purple-700 to-violet-500 bg-clip-text text-transparent">MealHub</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Register your restaurant</h1>
          <p className="text-gray-500 text-sm mb-8">Start serving customers on MealHub today</p>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">{error}</div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Jane Smith"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Restaurant name</label>
                <div className="relative">
                  <Store className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} required placeholder="e.g. The Corner Kitchen"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="owner@restaurant.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
                {loading ? 'Creating account…' : 'Create Restaurant Account →'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already registered?{' '}
              <Link href="/auth/login" className="text-purple-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
