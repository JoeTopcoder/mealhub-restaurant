'use client'

import { useState, type ReactNode, type ElementType } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Mail, Lock, Eye, EyeOff, User, Phone, MapPin,
  UtensilsCrossed, ShoppingBag, Store, Clock, FileText,
  Check, ChevronLeft, ChevronRight, ToggleLeft, ToggleRight,
  DollarSign,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const CUISINE_TYPES = [
  'American', 'Asian Fusion', 'Breakfast', 'Chinese', 'Coffee & Drinks',
  'Desserts', 'Fast Food', 'Healthy', 'Indian', 'Italian',
  'Japanese', 'Mediterranean', 'Mexican', 'Pizza', 'Seafood',
  'Sushi', 'Thai', 'Other',
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday',
  thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday',
}

type StoreType = 'food' | 'grocery' | 'both'

interface FormData {
  // Step 1 — Account
  ownerName: string
  email: string
  password: string
  // Step 2 — Restaurant info
  restaurantName: string
  description: string
  cuisineType: string
  phone: string
  // Step 3 — Store type
  storeType: StoreType
  // Step 4 — Location & delivery
  address: string
  deliveryFee: string
  estimatedTime: string
  // Step 5 — Operating hours
  hours: Record<string, { is_open: boolean; open: string; close: string }>
  // Step 6 — Documents
  businessRegNumber: string
  healthCertNumber: string
  foodLicenseNumber: string
  // Step 7 — Terms
  agreeTerms: boolean
  agreePrivacy: boolean
  agreeCommission: boolean
}

const DEFAULT_HOURS = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: { is_open: day !== 'sunday', open: '08:00', close: '22:00' },
}), {} as FormData['hours'])

const STEPS = [
  { title: 'Your Account',       subtitle: 'Create your login credentials' },
  { title: 'Restaurant Info',    subtitle: 'Tell us about your restaurant' },
  { title: 'Store Type',         subtitle: 'What do you sell?' },
  { title: 'Location & Delivery',subtitle: 'Where are you and how do you deliver?' },
  { title: 'Operating Hours',    subtitle: 'When are you open?' },
  { title: 'Business Documents', subtitle: 'Required for verification' },
  { title: 'Terms & Launch',     subtitle: 'Review and submit your application' },
]

export default function SignupPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [form, setForm] = useState<FormData>({
    ownerName: '', email: '', password: '',
    restaurantName: '', description: '', cuisineType: CUISINE_TYPES[0], phone: '',
    storeType: 'food',
    address: '', deliveryFee: '2.99', estimatedTime: '30',
    hours: DEFAULT_HOURS,
    businessRegNumber: '', healthCertNumber: '', foodLicenseNumber: '',
    agreeTerms: false, agreePrivacy: false, agreeCommission: false,
  })

  const set = (field: keyof FormData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const setDay = (day: string, field: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, hours: { ...prev.hours, [day]: { ...prev.hours[day], [field]: value } } }))

  function validate(): string {
    if (step === 0) {
      if (!form.ownerName.trim()) return 'Full name is required'
      if (!form.email.trim()) return 'Email is required'
      if (form.password.length < 6) return 'Password must be at least 6 characters'
    }
    if (step === 1) {
      if (!form.restaurantName.trim()) return 'Restaurant name is required'
    }
    if (step === 3) {
      if (!form.address.trim()) return 'Address is required'
    }
    if (step === 6) {
      if (!form.agreeTerms)       return 'You must accept the Terms of Service'
      if (!form.agreePrivacy)     return 'You must accept the Privacy Policy'
      if (!form.agreeCommission)  return 'You must accept the commission rate agreement'
    }
    return ''
  }

  function next() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    setStep(s => s + 1)
  }

  function back() {
    setError('')
    setStep(s => s - 1)
  }

  async function submit() {
    const err = validate()
    if (err) { setError(err); return }
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data, error: authErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.ownerName, role: 'restaurant_owner' } },
    })

    if (authErr) { setError(authErr.message); setLoading(false); return }
    if (!data.user) { setError('Signup failed. Please try again.'); setLoading(false); return }

    const userId = data.user.id

    // User profile
    await supabase.from('users').upsert({
      id: userId,
      email: form.email,
      name: form.ownerName,
      role: 'restaurant_owner',
    }, { onConflict: 'id' })

    // Restaurant record
    const { data: restaurant } = await supabase.from('restaurants').insert({
      owner_id:               userId,
      name:                   form.restaurantName,
      description:            form.description || null,
      cuisine_type:           form.cuisineType,
      phone:                  form.phone || null,
      address:                form.address || null,
      delivery_fee:           parseFloat(form.deliveryFee) || 0,
      estimated_delivery_time: parseInt(form.estimatedTime) || 30,
      store_type:             form.storeType,
      is_open:                false,
      is_verified:            false,
      status:                 'draft',
      onboarding_step:        7,
      operating_hours:        form.hours,
    }).select('id').single()

    // Business documents
    if (restaurant?.id) {
      const docs = [
        { type: 'business_registration', number: form.businessRegNumber },
        { type: 'health_certificate',    number: form.healthCertNumber },
        { type: 'food_service_license',  number: form.foodLicenseNumber },
      ].filter(d => d.number)

      if (docs.length > 0) {
        await supabase.from('restaurant_documents').insert(
          docs.map(d => ({
            restaurant_id: restaurant.id,
            document_type: d.type,
            document_number: d.number,
          }))
        )
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

  // ── Success screen ──
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-md text-center bg-white rounded-3xl border border-gray-100 shadow-lg p-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Application submitted!</h2>
          <p className="text-gray-500 text-sm mb-2">
            We sent a confirmation link to <strong>{form.email}</strong>.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Click the link to confirm your email, then our team will review your application within 48 hours.
          </p>
          <Link href="/auth/login"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-700 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all">
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  // ── Step progress bar ──
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left brand panel — desktop */}
      <div className="hidden lg:flex flex-col justify-between w-80 bg-gradient-to-br from-purple-700 via-violet-700 to-indigo-800 p-10 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-12">
            <Image src="/logo.png" alt="7Dash" width={40} height={40} className="rounded-xl flex-shrink-0" />
            <div>
              <p className="text-xl font-extrabold text-white">7Dash</p>
              <p className="text-purple-300 text-xs">Restaurant Portal</p>
            </div>
          </div>

          {/* Step list */}
          <div className="space-y-3">
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                i === step ? 'bg-white/15' : i < step ? 'opacity-60' : 'opacity-30'
              }`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                  i < step ? 'bg-green-400 text-white' : i === step ? 'bg-white text-purple-700' : 'bg-white/20 text-white'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <div>
                  <p className="text-white text-sm font-bold leading-tight">{s.title}</p>
                  <p className="text-purple-300 text-xs leading-tight">{s.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-5">
          <p className="text-white font-bold mb-1">Free 14-day trial</p>
          <p className="text-purple-300 text-xs leading-relaxed">0% commission for your first 14 days. Then just 10–15% — no contracts, no hidden fees.</p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 px-5 py-4 border-b border-gray-100 bg-white">
          <Image src="/logo.png" alt="7Dash" width={32} height={32} className="rounded-lg flex-shrink-0" />
          <span className="font-extrabold text-gray-900">7Dash</span>
          <span className="ml-auto text-xs text-gray-400 font-semibold">Step {step + 1} of {STEPS.length}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100">
          <div className="h-full bg-gradient-to-r from-purple-600 to-violet-700 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }} />
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-xl">
            {/* Step header */}
            <div className="mb-8">
              <p className="text-purple-600 text-xs font-bold uppercase tracking-widest mb-1">
                Step {step + 1} of {STEPS.length}
              </p>
              <h1 className="text-2xl font-extrabold text-gray-900">{STEPS[step].title}</h1>
              <p className="text-gray-500 text-sm mt-1">{STEPS[step].subtitle}</p>
            </div>

            {error && (
              <div className="mb-5 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-2xl border border-red-100 font-medium">
                {error}
              </div>
            )}

            {/* ── Step 0: Account ── */}
            {step === 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-4">
                <Field label="Full name" icon={<User />}>
                  <input type="text" value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
                    required placeholder="Jane Smith" autoFocus className={INPUT} />
                </Field>
                <Field label="Email address" icon={<Mail />}>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                    required placeholder="owner@restaurant.com" className={INPUT} />
                </Field>
                <Field label="Password" icon={<Lock />}
                  right={
                    <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }>
                  <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                    required placeholder="Min. 6 characters" className={`${INPUT} pr-10`} />
                </Field>
              </div>
            )}

            {/* ── Step 1: Restaurant info ── */}
            {step === 1 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-4">
                <Field label="Restaurant name" icon={<Store />}>
                  <input type="text" value={form.restaurantName} onChange={e => set('restaurantName', e.target.value)}
                    required placeholder="e.g. The Corner Kitchen" autoFocus className={INPUT} />
                </Field>
                <div>
                  <label className={LABEL}>Description</label>
                  <textarea value={form.description} onChange={e => set('description', e.target.value)}
                    placeholder="Tell customers what makes your restaurant special…" rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white resize-none" />
                </div>
                <div>
                  <label className={LABEL}>Cuisine type</label>
                  <select value={form.cuisineType} onChange={e => set('cuisineType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white">
                    {CUISINE_TYPES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="Phone number" icon={<Phone />}>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="+1 555-000-0000" className={INPUT} />
                </Field>
              </div>
            )}

            {/* ── Step 2: Store type ── */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {([
                  { value: 'food',    icon: UtensilsCrossed, label: 'Food Only',       desc: 'Restaurant meals & dishes' },
                  { value: 'grocery', icon: ShoppingBag,     label: 'Grocery Only',    desc: 'Supermarket & grocery items' },
                  { value: 'both',    icon: Store,           label: 'Food & Grocery',  desc: 'Both food and grocery' },
                ] as { value: StoreType; icon: ElementType; label: string; desc: string }[]).map(({ value, icon: Icon, label, desc }) => (
                  <button key={value} type="button" onClick={() => set('storeType', value)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border-2 text-center transition-all hover:-translate-y-1 ${
                      form.storeType === value
                        ? 'border-purple-500 bg-purple-50 shadow-lg shadow-purple-100'
                        : 'border-gray-200 bg-white hover:border-purple-200'
                    }`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      form.storeType === value ? 'bg-purple-600' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-7 h-7 ${form.storeType === value ? 'text-white' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    {form.storeType === value && (
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* ── Step 3: Location & Delivery ── */}
            {step === 3 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-4">
                <Field label="Restaurant address *" icon={<MapPin />}>
                  <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                    required placeholder="123 Main St, City, State, ZIP" autoFocus className={INPUT} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Delivery fee ($)" icon={<DollarSign />}>
                    <input type="number" step="0.50" min="0" value={form.deliveryFee} onChange={e => set('deliveryFee', e.target.value)}
                      className={INPUT} />
                  </Field>
                  <Field label="Est. delivery time (min)" icon={<Clock />}>
                    <input type="number" min="5" max="120" value={form.estimatedTime} onChange={e => set('estimatedTime', e.target.value)}
                      className={INPUT} />
                  </Field>
                </div>
                <div className="bg-purple-50 rounded-2xl p-4 text-sm text-purple-700">
                  <p className="font-bold mb-1">💡 Tip</p>
                  <p className="text-xs leading-relaxed">Set a realistic delivery time. Customers see this when ordering — accurate estimates lead to better reviews.</p>
                </div>
              </div>
            )}

            {/* ── Step 4: Operating Hours ── */}
            {step === 4 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-3">
                {DAYS.map(day => (
                  <div key={day} className={`flex items-center gap-3 px-3 py-3 rounded-2xl ${form.hours[day]?.is_open ? 'bg-gray-50' : 'bg-gray-50 opacity-50'}`}>
                    <button type="button" onClick={() => setDay(day, 'is_open', !form.hours[day]?.is_open)} className="flex-shrink-0">
                      {form.hours[day]?.is_open
                        ? <ToggleRight className="w-7 h-7 text-green-500" />
                        : <ToggleLeft  className="w-7 h-7 text-gray-300" />}
                    </button>
                    <span className="w-24 text-sm font-bold text-gray-600">{DAY_LABELS[day]}</span>
                    {form.hours[day]?.is_open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input type="time" value={form.hours[day]?.open ?? '08:00'}
                          onChange={e => setDay(day, 'open', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                        <span className="text-gray-400 text-xs font-medium">to</span>
                        <input type="time" value={form.hours[day]?.close ?? '22:00'}
                          onChange={e => setDay(day, 'close', e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Closed</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── Step 5: Documents ── */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                  <FileText className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-800">Why we need these</p>
                    <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                      Business documents are required for partner verification. Document numbers are sufficient — you can upload files later from your dashboard.
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-5">
                  {[
                    { field: 'businessRegNumber', label: 'Business Registration Number', placeholder: 'e.g. BRN-2024-000123', required: true },
                    { field: 'healthCertNumber',  label: 'Health Certificate Number',    placeholder: 'e.g. HC-2024-000456', required: false },
                    { field: 'foodLicenseNumber', label: 'Food Service License Number',  placeholder: 'e.g. FSL-2024-000789', required: false },
                  ].map(({ field, label, placeholder, required }) => (
                    <div key={field}>
                      <label className={LABEL}>
                        {label}
                        {required ? <span className="text-red-400 ml-1">*</span> : <span className="text-gray-400 ml-1 text-xs">(optional)</span>}
                      </label>
                      <input
                        type="text"
                        value={form[field as keyof FormData] as string}
                        onChange={e => set(field as keyof FormData, e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white font-mono tracking-wide"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Step 6: Terms ── */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7 space-y-5">
                  {[
                    { field: 'agreeTerms',       label: 'I agree to the 7Dash Terms of Service', desc: 'You agree to comply with our platform rules and partner guidelines.' },
                    { field: 'agreePrivacy',      label: 'I accept the Privacy Policy',             desc: 'You consent to how we collect and process restaurant and order data.' },
                    { field: 'agreeCommission',   label: 'I accept the commission rate agreement',  desc: '0% for first 14 days, then 10–15% per order. No hidden fees or contracts.' },
                  ].map(({ field, label, desc }) => (
                    <button
                      key={field}
                      type="button"
                      onClick={() => set(field as keyof FormData, !form[field as keyof FormData])}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all ${
                        form[field as keyof FormData]
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex-shrink-0 mt-0.5 flex items-center justify-center border-2 transition-all ${
                        form[field as keyof FormData]
                          ? 'bg-purple-600 border-purple-600'
                          : 'bg-white border-gray-300'
                      }`}>
                        {form[field as keyof FormData] && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-3xl p-6 text-white">
                  <h3 className="font-extrabold text-base mb-3">Your application summary</h3>
                  <div className="space-y-1.5 text-sm text-purple-200">
                    <p>🏪 <strong className="text-white">{form.restaurantName}</strong></p>
                    <p>🍽️ {form.cuisineType} · {form.storeType === 'both' ? 'Food & Grocery' : form.storeType === 'food' ? 'Food' : 'Grocery'}</p>
                    <p>📍 {form.address || 'No address provided'}</p>
                    <p>💳 ${form.deliveryFee} delivery fee · {form.estimatedTime} min est.</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Navigation ── */}
            <div className="flex items-center justify-between mt-8">
              {step > 0 ? (
                <button type="button" onClick={back}
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border-2 border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              ) : (
                <Link href="/auth/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                  Already registered? Sign in
                </Link>
              )}

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next}
                  className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={loading}
                  className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-violet-700 text-white rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all disabled:opacity-60">
                  {loading ? 'Submitting…' : (
                    <><Check className="w-4 h-4" /> Submit Application</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──

const INPUT = 'w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white transition-colors'
const LABEL = 'block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 '

function Field({ label, icon, children, right }: {
  label: string
  icon: ReactNode
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div>
      <label className={LABEL}>{label}</label>
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none">
          {icon}
        </span>
        {children}
        {right}
      </div>
    </div>
  )
}
