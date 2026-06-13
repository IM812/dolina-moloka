export type DbProduct = {
  id: string
  name: string
  slug: string
  description: string | null
  full_description: string | null
  price: number
  image_url: string | null
  volume: string | null
  composition: string | null
  storage_conditions: string | null
  category: string
  in_stock: boolean
  created_at: string
}

export type DbCustomer = {
  id: string
  full_name: string
  phone: string
  email: string | null
  pickup_address: string | null
  created_at: string
}

export type DbOrder = {
  id: string
  order_number: string
  customer_id: string
  total_amount: number
  payment_status: 'pending' | 'paid' | 'cancelled'
  delivery_status: 'new' | 'processing' | 'completed' | 'cancelled'
  comment: string | null
  created_at: string
  customers?: DbCustomer
  order_items?: DbOrderItem[]
}

export type DbOrderItem = {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  quantity: number
  price: number
}
