'use client'

import { useState } from 'react'
import { MenuItem, MenuItemSide } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import {
  Plus, Trash2, Edit3, ChevronDown, ChevronUp, ToggleLeft,
  ToggleRight, Tag, DollarSign, X, Check,
} from 'lucide-react'

const CATEGORIES = [
  'Breakfast', 'Starters', 'Mains', 'Sides', 'Burgers', 'Pizza', 'Pasta',
  'Salads', 'Sandwiches', 'Wraps', 'Sushi', 'Desserts', 'Drinks', 'Specials',
]

type MenuItemWithSides = MenuItem & { sides?: MenuItemSide[] }

export default function MenuClient({ initialItems, restaurantId }: { initialItems: MenuItemWithSides[]; restaurantId: string }) {
  const [items, setItems] = useState<MenuItemWithSides[]>(initialItems)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showAddItem, setShowAddItem] = useState(false)
  const [addingSide, setAddingSide] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  // Add item form state
  const [newItem, setNewItem] = useState({
    name: '', description: '', price: '', category: CATEGORIES[0],
    customCategory: '', discount: '0', is_available: true,
  })
  const [newSide, setNewSide] = useState({ name: '', price: '', side_type: 'side' as 'side' | 'drink' })

  // Group by category
  const byCategory = items.reduce<Record<string, MenuItemWithSides[]>>((acc, item) => {
    const cat = item.category || 'Uncategorised'
    ;(acc[cat] = acc[cat] ?? []).push(item)
    return acc
  }, {})

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    setLoading('addItem')
    const supabase = createClient()
    const category = newItem.customCategory || newItem.category
    const { data, error } = await supabase.from('menu_items').insert({
      restaurant_id: restaurantId,
      name: newItem.name,
      description: newItem.description || null,
      price: parseFloat(newItem.price),
      category,
      discount: parseFloat(newItem.discount) || 0,
      is_available: newItem.is_available,
      in_stock: true,
      product_type: 'food',
    }).select().single()
    if (!error && data) {
      setItems(prev => [...prev, { ...data, sides: [] }])
      setNewItem({ name: '', description: '', price: '', category: CATEGORIES[0], customCategory: '', discount: '0', is_available: true })
      setShowAddItem(false)
    }
    setLoading(null)
  }

  async function deleteItem(id: string) {
    if (!confirm('Delete this menu item?')) return
    setLoading('del-' + id)
    const supabase = createClient()
    await supabase.from('menu_items').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    setLoading(null)
  }

  async function toggleAvailability(item: MenuItemWithSides) {
    setLoading('toggle-' + item.id)
    const supabase = createClient()
    await supabase.from('menu_items').update({ is_available: !item.is_available }).eq('id', item.id)
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: !i.is_available } : i))
    setLoading(null)
  }

  async function addSide(itemId: string) {
    if (!newSide.name || !newSide.price) return
    setLoading('side-' + itemId)
    const supabase = createClient()
    const { data, error } = await supabase.from('menu_item_sides').insert({
      menu_item_id: itemId,
      name: newSide.name,
      price: parseFloat(newSide.price),
      side_type: newSide.side_type,
      is_available: true,
    }).select().single()
    if (!error && data) {
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, sides: [...(i.sides ?? []), data] } : i))
      setNewSide({ name: '', price: '', side_type: 'side' })
      setAddingSide(null)
    }
    setLoading(null)
  }

  async function deleteSide(itemId: string, sideId: string) {
    const supabase = createClient()
    await supabase.from('menu_item_sides').delete().eq('id', sideId)
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, sides: (i.sides ?? []).filter(s => s.id !== sideId) } : i))
  }

  const discountedPrice = (item: MenuItem) =>
    item.discount && item.discount > 0 ? item.price * (1 - item.discount / 100) : item.price

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Menu</h1>
          <p className="text-sm text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''} across {Object.keys(byCategory).length} categor{Object.keys(byCategory).length !== 1 ? 'ies' : 'y'}</p>
        </div>
        <button onClick={() => setShowAddItem(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm shadow-md hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Add item modal */}
      {showAddItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900">New Menu Item</h3>
              <button onClick={() => setShowAddItem(false)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={addItem} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Item Name *</label>
                  <input required value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Grilled Chicken Burger"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                  <textarea value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                    placeholder="Optional description…" rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Price ($) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input required type="number" step="0.01" min="0" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                      placeholder="0.00" className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Discount (%)</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="number" min="0" max="100" value={newItem.discount} onChange={e => setNewItem(p => ({ ...p, discount: e.target.value }))}
                      className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white" />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category *</label>
                  <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value, customCategory: '' }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    <option value="__custom">Custom category…</option>
                  </select>
                  {newItem.category === '__custom' && (
                    <input value={newItem.customCategory} onChange={e => setNewItem(p => ({ ...p, customCategory: e.target.value }))}
                      placeholder="Type category name…" className="mt-2 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 focus:bg-white" />
                  )}
                </div>
                <div className="col-span-2 flex items-center justify-between bg-gray-50 rounded-xl p-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Available now</p>
                    <p className="text-xs text-gray-400">Customers can order this item</p>
                  </div>
                  <button type="button" onClick={() => setNewItem(p => ({ ...p, is_available: !p.is_available }))}
                    className="flex-shrink-0">
                    {newItem.is_available
                      ? <ToggleRight className="w-8 h-8 text-green-500" />
                      : <ToggleLeft className="w-8 h-8 text-gray-400" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading === 'addItem'}
                className="w-full bg-gradient-to-r from-purple-600 to-violet-700 text-white py-3.5 rounded-2xl font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60 shadow-md">
                {loading === 'addItem' ? 'Adding…' : 'Add to Menu'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu grouped by category */}
      {items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm py-24 text-center">
          <div className="text-5xl mb-4">🍽️</div>
          <p className="text-gray-500 font-semibold mb-1">No menu items yet</p>
          <p className="text-gray-400 text-sm mb-6">Add your first dish to get started</p>
          <button onClick={() => setShowAddItem(true)}
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-2xl font-bold text-sm hover:bg-purple-700 transition-colors">
            <Plus className="w-4 h-4" /> Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCategory).map(([category, catItems]) => (
            <div key={category}>
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-sm font-extrabold text-gray-500 uppercase tracking-wider">{category}</h2>
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">{catItems.length}</span>
              </div>

              <div className="space-y-2">
                {catItems.map(item => {
                  const isExpanded = expanded === item.id
                  const dPrice = discountedPrice(item)

                  return (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="flex items-center gap-4 px-4 py-3.5">
                        {/* Availability toggle */}
                        <button onClick={() => toggleAvailability(item)} disabled={loading === 'toggle-' + item.id} className="flex-shrink-0">
                          {item.is_available
                            ? <ToggleRight className="w-6 h-6 text-green-500" />
                            : <ToggleLeft className="w-6 h-6 text-gray-300" />}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm font-bold ${!item.is_available ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                              {item.name}
                            </p>
                            {item.discount && item.discount > 0 ? (
                              <span className="text-xs font-bold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                {item.discount}% off
                              </span>
                            ) : null}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-400 truncate mt-0.5">{item.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-sm font-extrabold text-gray-900">${dPrice.toFixed(2)}</p>
                            {item.discount && item.discount > 0 ? (
                              <p className="text-xs text-gray-400 line-through">${item.price.toFixed(2)}</p>
                            ) : null}
                          </div>
                          <button onClick={() => setExpanded(isExpanded ? null : item.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                          </button>
                          <button onClick={() => deleteItem(item.id)} disabled={loading === 'del-' + item.id}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded: sides */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-gray-50 px-4 py-4">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs font-extrabold text-gray-500 uppercase tracking-wide">Add-ons & Sides</p>
                            <button onClick={() => setAddingSide(addingSide === item.id ? null : item.id)}
                              className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors">
                              <Plus className="w-3.5 h-3.5" /> Add
                            </button>
                          </div>

                          {(item.sides ?? []).length === 0 && addingSide !== item.id && (
                            <p className="text-xs text-gray-400 mb-2">No add-ons yet</p>
                          )}

                          <div className="space-y-1.5 mb-2">
                            {(item.sides ?? []).map(side => (
                              <div key={side.id} className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                                    side.side_type === 'drink' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                  }`}>{side.side_type}</span>
                                  <span className="text-sm text-gray-700 font-medium">{side.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-gray-700">+${side.price.toFixed(2)}</span>
                                  <button onClick={() => deleteSide(item.id, side.id)}
                                    className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {addingSide === item.id && (
                            <div className="bg-white rounded-xl border border-purple-200 p-3 space-y-2">
                              <div className="grid grid-cols-3 gap-2">
                                <input value={newSide.name} onChange={e => setNewSide(p => ({ ...p, name: e.target.value }))}
                                  placeholder="Name" className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                <div className="relative">
                                  <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
                                  <input type="number" step="0.01" min="0" value={newSide.price} onChange={e => setNewSide(p => ({ ...p, price: e.target.value }))}
                                    placeholder="0.00" className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-400" />
                                </div>
                                <select value={newSide.side_type} onChange={e => setNewSide(p => ({ ...p, side_type: e.target.value as 'side' | 'drink' }))}
                                  className="px-2 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white">
                                  <option value="side">Side</option>
                                  <option value="drink">Drink</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => addSide(item.id)} disabled={loading === 'side-' + item.id}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 disabled:opacity-50 transition-colors">
                                  <Check className="w-3 h-3" /> Add
                                </button>
                                <button onClick={() => setAddingSide(null)}
                                  className="px-3 py-1.5 text-gray-500 hover:text-gray-700 text-xs font-medium">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
