export interface Restaurant {
  id: string
  owner_id: string
  name: string
  description?: string
  image_url?: string
  phone?: string
  email?: string
  address?: string
  latitude?: number
  longitude?: number
  cuisine_type?: string
  rating?: number
  review_count?: number
  delivery_fee?: number
  estimated_delivery_time?: number
  is_open: boolean
  is_verified: boolean
  status: 'draft' | 'active' | 'pending' | 'suspended'
  onboarding_step: number
  commission_rate?: number
  service_fee?: number
  operating_hours?: Record<string, { open: string; close: string; is_open: boolean }>
  bank_name?: string
  bank_branch?: string
  bank_account_number?: string
  bank_account_holder?: string
  bank_account_type?: string
  store_type: 'food' | 'grocery' | 'both'
  created_at: string
  updated_at?: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category: string
  is_available: boolean
  discount?: number
  preparation_time?: number
  product_type: 'food' | 'grocery'
  in_stock: boolean
  created_at: string
}

export interface MenuItemSide {
  id: string
  menu_item_id: string
  name: string
  price: number
  is_available: boolean
  side_type: 'side' | 'drink'
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'delivered' | 'cancelled'

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  item_name: string
  quantity: number
  unit_price: number
  subtotal: number
  notes?: string
}

export interface Order {
  id: string
  restaurant_id: string
  user_id: string
  items: OrderItem[]
  total_amount: number
  delivery_fee: number
  service_fee?: number
  status: OrderStatus
  payment_method?: string
  delivery_address?: string
  notes?: string
  is_pickup: boolean
  pickup_code?: string
  ordered_at: string
  estimated_prep_minutes?: number
  restaurant_order_number?: string
  receipt_number?: string
  user?: { name?: string; phone?: string }
}

export interface LoyaltyAccount {
  id: string
  user_id: string
  points_balance: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  total_earned: number
  total_redeemed: number
}

export interface PayoutRequest {
  id: string
  restaurant_id?: string
  driver_id?: string
  amount: number
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected'
  type: 'restaurant' | 'driver'
  bank_name?: string
  bank_account?: string
  account_holder?: string
  created_at: string
  processed_at?: string
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'New Order',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready: 'Ready',
  picked_up: 'Picked Up',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  preparing: 'bg-orange-100 text-orange-700',
  ready: 'bg-green-100 text-green-700',
  picked_up: 'bg-purple-100 text-purple-700',
  delivered: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-600',
}
