'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChefHat, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Suspense } from 'react'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl border border-red-100">{error}</div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
            placeholder="owner@restaurant.com"
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
          <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 to-violet-700 text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-purple-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2">
        {loading ? 'Signing in…' : 'Sign In to Portal →'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left panel — brand */}
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
            Manage your<br />restaurant, effortlessly.
          </h2>
          <p className="text-purple-200 text-sm leading-relaxed">
            Track orders in real-time, manage your menu, view analytics, and grow your customer base — all in one place.
          </p>
        </div>
        <div className="space-y-4">
          {['Real-time order notifications', 'Menu management', 'Earnings & payouts', 'Customer loyalty analytics'].map(f => (
            <div key={f} className="flex items-center gap-3 text-sm text-purple-200">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs">✓</span>
              </div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-purple-700 to-violet-500 bg-clip-text text-transparent">MealHub</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to your restaurant account</p>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
            <Suspense>
              <LoginForm />
            </Suspense>

            <p className="text-center text-sm text-gray-500 mt-6">
              New restaurant partner?{' '}
              <Link href="/auth/signup" className="text-purple-600 font-semibold hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
