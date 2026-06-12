import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import {
  Percent, Store, Zap, Headphones, Shield, ArrowRight,
  Star, Package, Users, CheckCircle2,
} from 'lucide-react'

export default async function LandingPage() {
  let isLoggedIn = false
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    isLoggedIn = !!user
  } catch {}

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif" }}>

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <img src="/logo.jpg" alt="7Dash" className="rounded-xl" style={{ width: 36, height: 36 }} />
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">7Dash</span>
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#why"    className="hover:text-slate-900 transition-colors">Why 7Dash</a>
            <a href="#how"    className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
            <a href="#stories" className="hover:text-slate-900 transition-colors">Success Stories</a>
            <a href="#support" className="hover:text-slate-900 transition-colors">Support</a>
          </div>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href="/dashboard"
                className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link href="/auth/login"
                  className="hidden sm:inline-flex border-2 border-slate-800 text-slate-800 font-bold px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors">
                  Log In
                </Link>
                <Link href="/auth/signup"
                  className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm">
                  Get Onboarded
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 items-center min-h-[600px]">

            {/* Left: content */}
            <div className="py-16 lg:py-20 lg:pr-12">
              <h1 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.08] tracking-tight mb-5">
                More Orders.<br />
                Lower Commissions.<br />
                <span className="text-amber-400">Grow Your Restaurant.</span>
              </h1>
              <p className="text-slate-500 text-lg mb-8 leading-relaxed max-w-md">
                Join 7Dash and keep more of your hard-earned revenue while we help you reach more local customers.
              </p>

              {/* Mini benefit badges */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-10">
                {[
                  { icon: Percent,    label: 'Lower Commissions',   sub: 'Keep More Profit' },
                  { icon: Store,      label: 'More Local Customers', sub: 'Grow Your Business' },
                  { icon: Zap,        label: 'Fast Payouts',        sub: 'Get Paid Quickly' },
                  { icon: Headphones, label: 'Dedicated Support',   sub: "We're Here to Help" },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-400">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <Link href="/auth/signup"
                  className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-7 py-3.5 rounded-xl text-sm shadow-lg hover:-translate-y-0.5 transition-all">
                  Get Onboarded Now <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how"
                  className="flex items-center gap-1.5 text-slate-700 font-semibold text-sm hover:text-slate-900 transition-colors">
                  Learn More <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust line */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>No Setup Fee</span>
                <span className="text-slate-300">•</span>
                <span>No Long-Term Contracts</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-amber-600">0% Commission for 14 Days</span>
              </div>
            </div>

            {/* Right: restaurant photo + floating cards */}
            <div className="hidden lg:block relative h-[600px]">
              {/* Photo fills the column */}
              <div className="absolute inset-0 overflow-hidden rounded-bl-[48px]">
                <Image
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=700&fit=crop"
                  alt="Restaurant"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Dark overlay on left edge for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-transparent" />
              </div>

              {/* Floating: 0% commission card */}
              <div className="absolute top-8 right-6 bg-slate-900 text-white rounded-2xl p-5 w-[190px] shadow-2xl z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3 h-3 text-slate-900" />
                  </div>
                  <span className="text-amber-400 text-xs font-bold leading-tight">Limited Time Offer</span>
                </div>
                <p className="text-5xl font-extrabold text-amber-400 leading-none mb-1">0%</p>
                <p className="text-sm font-semibold text-white leading-snug">
                  Commission<br />for the First<br />
                  <span className="text-amber-400">14 Days!</span>
                </p>
              </div>

              {/* Curved arrow decoration */}
              <div className="absolute top-[178px] right-[190px] text-amber-400 text-3xl rotate-12 z-10 select-none">↙</div>

              {/* Floating: testimonial card */}
              <div className="absolute bottom-12 right-6 bg-slate-900 text-white rounded-2xl p-5 w-[220px] shadow-2xl z-10">
                <div className="text-amber-400 text-2xl font-extrabold leading-none mb-2">"</div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  7Dash has helped us reduce fees and increase our online orders. It's a win-win!
                </p>
                <div className="border-t border-slate-700 pt-2.5">
                  <p className="text-xs font-bold text-amber-400">— Michael T.</p>
                  <p className="text-xs text-slate-500">Restaurant Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof bar ── */}
      <section className="bg-slate-900 py-9">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <p className="text-white font-extrabold text-base">Trusted by Restaurants</p>
              <p className="text-slate-400 text-sm mt-0.5">Across the <span className="text-amber-400 font-extrabold">USA</span></p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-10">
              {[
                { icon: Store,   value: '500+',   label: 'Restaurants' },
                { icon: Users,   value: '250K+',  label: 'Happy Customers' },
                { icon: Package, value: '1M+',    label: 'Orders Delivered' },
                { icon: Star,    value: '4.8★',   label: 'Average Rating' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full border-2 border-slate-700 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-lg leading-tight">{value}</p>
                    <p className="text-slate-400 text-xs">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">How 7Dash Works for Your Restaurant</h2>
            <div className="w-16 h-1 bg-amber-400 rounded-full mx-auto mt-3" />
          </div>

          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* 4 steps */}
            <div className="flex-1">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
                {/* Dotted connector line */}
                <div className="hidden md:block absolute top-9 left-[12%] right-[12%] border-t-2 border-dashed border-amber-300 z-0" />

                {[
                  { icon: '📋', title: 'Get Onboarded', desc: "Fill out our quick form and we'll take care of the rest." },
                  { icon: '🏪', title: 'Go Live',       desc: 'We set up your menu, store, and start listing your restaurant.' },
                  { icon: '🛵', title: 'Get Orders',    desc: 'Receive more orders from local customers on 7Dash.' },
                  { icon: '💵', title: 'Get Paid',      desc: 'Enjoy fast payouts and keep more of your hard-earned money.' },
                ].map(({ icon, title, desc }, i) => (
                  <div key={title} className="flex flex-col items-center text-center relative z-10">
                    <div className="w-[72px] h-[72px] rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-3xl mb-4 shadow-sm">
                      {icon}
                    </div>
                    <p className="text-sm font-extrabold text-slate-900 mb-1.5">{i + 1}. {title}</p>
                    <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-7 lg:w-72 w-full flex-shrink-0 text-center">
              <h3 className="font-extrabold text-slate-900 text-lg mb-2 leading-snug">Ready to Grow Your Restaurant?</h3>
              <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                Join 7Dash today and start receiving more orders with lower commissions.
              </p>
              <Link href="/auth/signup"
                className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-5 py-3.5 rounded-xl text-sm shadow transition-all w-full">
                Get Onboarded Now <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-xs text-slate-400 mt-3 font-medium">It only takes 2 minutes!</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why 7Dash ── */}
      <section id="why" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-amber-500 font-extrabold text-sm uppercase tracking-widest mb-3">Why 7Dash</p>
              <h2 className="text-4xl font-extrabold text-slate-900 leading-snug mb-6">
                Everything you need to run a successful restaurant
              </h2>
              <p className="text-slate-500 text-base leading-relaxed mb-8">
                We give you the tools, customers, and support to grow your restaurant — without the ridiculous fees that eat into your profits.
              </p>
              <div className="space-y-4">
                {[
                  'Real-time order dashboard — accept, track & manage',
                  'Full menu management with discounts & availability',
                  'Revenue analytics & top item reports',
                  'Built-in customer loyalty rewards program',
                  'Fast payouts — request anytime, receive in 24–48h',
                  'Dedicated onboarding & support team',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span className="text-slate-700 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing card */}
            <div id="pricing">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-slate-900 p-7 text-center">
                  <p className="text-amber-400 font-bold text-sm mb-1">Simple, transparent pricing</p>
                  <p className="text-6xl font-extrabold text-amber-400">0%</p>
                  <p className="text-white text-lg font-bold mt-1">Commission for 14 days</p>
                  <p className="text-slate-400 text-sm mt-1">No credit card required</p>
                </div>
                <div className="p-7 space-y-3">
                  {[
                    ['After trial', '10–15% per order (vs 25–30% elsewhere)'],
                    ['Setup fee', '$0 — completely free to join'],
                    ['Contract', 'None — cancel anytime'],
                    ['Payouts', '24–48h bank transfer'],
                    ['Support', 'Dedicated partner support'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between text-sm pb-3 border-b border-gray-100 last:border-0">
                      <span className="text-slate-500 font-medium">{label}</span>
                      <span className="font-extrabold text-slate-900">{value}</span>
                    </div>
                  ))}
                  <Link href="/auth/signup"
                    className="mt-4 flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-5 py-3.5 rounded-xl text-sm shadow w-full transition-all">
                    Start Free Today <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Success stories ── */}
      <section id="stories" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-amber-500 font-extrabold text-sm uppercase tracking-widest mb-3">Success Stories</p>
            <h2 className="text-4xl font-extrabold text-slate-900">What our partners say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Marcus T.',   biz: 'The Smokehouse Grill',    text: 'Since joining 7Dash, our revenue is up 40%. The dashboard makes managing orders effortless.', stars: 5 },
              { name: 'Sandra L.',   biz: 'Sunrise Breakfast Co.',   text: 'The 0% trial convinced me to try it. We went live in 48 hours and had orders the same day.', stars: 5 },
              { name: 'James K.',    biz: 'Kings Jerk Chicken',      text: 'Commissions are fair, payouts are fast, and the loyalty program keeps our regulars coming back.', stars: 5 },
            ].map(({ name, biz, text, stars }) => (
              <div key={name} className="bg-slate-50 rounded-3xl p-6 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                  <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-slate-900 font-extrabold text-sm flex-shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900">{name}</p>
                    <p className="text-xs text-slate-500">{biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-amber-400 font-extrabold text-sm uppercase tracking-widest mb-4">Limited Time</p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Start with 0% commission<br />for your first 14 days
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            No contracts. No setup fees. Just more orders, more revenue, and a platform that works for you.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup"
              className="flex items-center gap-2.5 bg-amber-400 hover:bg-amber-500 text-slate-900 font-extrabold px-9 py-4 rounded-2xl text-base shadow-xl hover:-translate-y-0.5 transition-all">
              Get Onboarded Now <ArrowRight className="w-5 h-5" />
            </Link>
            {!isLoggedIn && (
              <Link href="/auth/login" className="text-slate-400 hover:text-white text-sm font-semibold transition-colors">
                Already a partner? Sign in →
              </Link>
            )}
          </div>
          <p className="text-slate-600 text-xs mt-6">No credit card required · Cancel anytime · Go live in 48 hours</p>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-500 py-8" id="support">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.jpg" alt="7Dash" className="rounded-lg" style={{ width: 28, height: 28 }} />
            <span className="font-extrabold text-white">7Dash</span>
            <span className="text-slate-600 text-sm">for Restaurants</span>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} 7Dash. All rights reserved.</p>
          <div className="flex gap-5 text-sm">
            <Link href="/auth/login"  className="hover:text-white transition-colors">Sign In</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
