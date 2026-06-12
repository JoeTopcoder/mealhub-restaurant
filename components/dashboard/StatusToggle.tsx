'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ToggleLeft, ToggleRight } from 'lucide-react'

export default function StatusToggle({ restaurantId, initialOpen }: { restaurantId: string; initialOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [saving, setSaving] = useState(false)

  async function toggle() {
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('restaurants')
      .update({ is_open: !isOpen })
      .eq('id', restaurantId)
    if (!error) setIsOpen(v => !v)
    setSaving(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm ${
        isOpen
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } disabled:opacity-60`}
    >
      {isOpen
        ? <ToggleRight className="w-5 h-5 text-green-600" />
        : <ToggleLeft className="w-5 h-5 text-gray-400" />}
      {saving ? 'Saving…' : isOpen ? 'Open for Orders' : 'Currently Closed'}
    </button>
  )
}
