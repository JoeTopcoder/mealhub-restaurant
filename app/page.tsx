import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ChefHat, TrendingUp, Zap, Shield, Star, BarChart3, Clock, ArrowRight } from 'lucide-react'

export default async function LandingPage() {
  let isLoggedIn = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {}

  return (
    <div className="min-h-screen bg-white">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-extrabold bg-gradient-to-r from-purple-700 to-violet-500 bg-clip-text text-transparent">MealHub</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-1.5">for Restaurants</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard"
                className="flex items-center gap-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-700 text-white px-5 py-2.5 rounded-xl shadow hover:opacity-90 transition-all">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/auth/login" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="text-sm font-bold bg-gradient-to-r from-purple-600 to-violet-700 text-white px-5 py-2.5 rounded-xl shadow hover:opacity-90 transition-all">
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800 pt-24 pb-36">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-5 py-2 text-sm text-white font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Now accepting restaurant partners
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6">
            Grow your restaurant<br />
            <span className="text-yellow-300">with MealHub.</span>
          </h1>
          <p className="text-purple-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Reach thousands of hungry customers in your area. Manage orders, menus, and earnings — all from one beautiful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard"
                className="flex items-center gap-2.5 bg-white text-purple-700 px-8 py-4 rounded-2xl font-extrabold text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                Go to Your Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link href="/auth/signup"
                  className="flex items-center gap-2.5 bg-white text-purple-700 px-8 py-4 rounded-2xl font-extrabold text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                  Start for Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/auth/login"
                  className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold transition-colors">
                  Already a partner? Sign in →
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-10 border-t border-white/20">
            {[
              { value: '0%',    label: 'Commission for 14 days' },
              { value: '10–15%',label: 'Then — vs 25–30% elsewhere' },
              { value: '24h',   label: 'Payout turnaround' },
              { value: '48h',   label: 'Go live after approval' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{value}</p>
                <p className="text-purple-300 text-xs mt-1 max-w-[120px] leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Wave */}
        <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none">
          <path d="M0 60L1440 60L1440 20C1200 55 960 5 720 20C480 35 240 5 0 20V60Z" fill="white" />
        </svg>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-purple-600 font-bold text-sm uppercase tracking-widest mb-3">Simple Process</p>
          <h2 className="text-4xl font-extrabold text-gray-900">Go live in 3 steps</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '01', icon: '📝', title: 'Register your restaurant', desc: 'Fill in your restaurant details, menu, and delivery settings. Takes about 5 minutes.' },
            { step: '02', icon: '✅', title: 'Get verified',             desc: "Our team reviews your application within 48 hours. We'll notify you by email once approved." },
            { step: '03', icon: '🚀', title: 'Start receiving orders',   desc: 'Toggle your restaurant open and watch orders come in. Manage everything from your dashboard.' },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="relative bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="absolute -top-4 left-8 bg-gradient-to-r from-purple-600 to-violet-700 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
                Step {step}
              </div>
              <div className="text-4xl mb-4 mt-2">{icon}</div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-purple-600 font-bold text-sm uppercase tracking-widest mb-3">Everything you need</p>
            <h2 className="text-4xl font-extrabold text-gray-900">Built for restaurant owners</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap,        color: 'text-yellow-600', bg: 'bg-yellow-50', title: 'Real-time Orders',   desc: 'New orders appear instantly. Accept, prepare, and mark ready with one tap.' },
              { icon: BarChart3,  color: 'text-blue-600',   bg: 'bg-blue-50',   title: 'Revenue Analytics', desc: 'Daily, weekly, and monthly revenue charts. See your top-selling items at a glance.' },
              { icon: TrendingUp, color: 'text-green-600',  bg: 'bg-green-50',  title: 'Menu Management',   desc: 'Add items, set prices, apply discounts, and toggle availability in seconds.' },
              { icon: Star,       color: 'text-purple-600', bg: 'bg-purple-50', title: 'Loyalty Program',    desc: 'Customers earn points automatically. Watch repeat orders grow every month.' },
              { icon: Shield,     color: 'text-red-500',    bg: 'bg-red-50',    title: 'Fast Payouts',      desc: 'Request your earnings anytime. Bank transfers processed within 24–48 hours.' },
              { icon: Clock,      color: 'text-orange-600', bg: 'bg-orange-50', title: 'Operating Hours',    desc: 'Set your schedule per day. Customers see your real-time open/closed status.' },
            ].map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all">
                <div className={`w-11 h-11 rounded-2xl ${bg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison ── */}
      <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Why partner with us?</h2>
          <p className="text-gray-500 text-lg">We keep more money in your pocket.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase tracking-wide">
            <div className="px-6 py-4">Feature</div>
            <div className="px-6 py-4 text-purple-700 text-center">MealHub ✓</div>
            <div className="px-6 py-4 text-center">Competitors</div>
          </div>
          {[
            ['Commission rate',    '10–15%',      '25–30%'],
            ['Free trial',         '14 days',     'None'],
            ['Payout speed',       '24–48 hours', '7–14 days'],
            ['Contracts',          'None',        'Required'],
            ['Setup fee',          '$0',          '$100–500'],
            ['Loyalty program',    'Built-in',    'Extra cost'],
            ['Customer ownership', 'Yours',       'Platform owns'],
          ].map(([feature, ours, theirs]) => (
            <div key={feature} className="grid grid-cols-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className="px-6 py-4 text-sm font-semibold text-gray-700">{feature}</div>
              <div className="px-6 py-4 text-sm font-bold text-green-600 text-center">{ours}</div>
              <div className="px-6 py-4 text-sm text-gray-400 text-center">{theirs}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonial ── */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-violet-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="text-5xl mb-6">⭐⭐⭐⭐⭐</div>
          <blockquote className="text-2xl font-bold text-gray-900 leading-snug mb-6">
            &ldquo;Since joining MealHub, our monthly revenue has increased by 40%. The dashboard makes managing orders so much easier.&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white font-extrabold">M</div>
            <div className="text-left">
              <p className="text-sm font-bold text-gray-900">Marcus Johnson</p>
              <p className="text-xs text-gray-500">Owner, The Smokehouse Grill</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Ready to grow your restaurant?
          </h2>
          <p className="text-purple-200 text-lg mb-10">Join today. 0% commission for your first 14 days. No credit card required.</p>
          {isLoggedIn ? (
            <Link href="/dashboard"
              className="inline-flex items-center gap-3 bg-white text-purple-700 px-10 py-5 rounded-2xl font-extrabold text-lg shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1 transition-all">
              Go to Your Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <Link href="/auth/signup"
              className="inline-flex items-center gap-3 bg-white text-purple-700 px-10 py-5 rounded-2xl font-extrabold text-lg shadow-2xl hover:shadow-purple-900/40 hover:-translate-y-1 transition-all">
              Register Your Restaurant
              <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white">MealHub</span>
            <span className="text-gray-600 text-sm">Restaurant Portal</span>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} MealHub. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <Link href="/auth/login"  className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
