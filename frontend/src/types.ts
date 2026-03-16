export interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
  created_at: string;
}

export type QualityTier = 'budget' | 'standard' | 'premium';

export interface ItemVariant {
  id: string;
  item_id: string;
  brand: string | null;
  quality_tier: QualityTier;
  size: string | null;
  base_price: number;
  is_organic: 0 | 1;
  is_active: 0 | 1;
  created_at: string;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  unit: string;
  image_url: string | null;
  is_active: 0 | 1;
  category_name: string;
  category_icon: string;
  min_price: number | null;
  max_price: number | null;
  variant_count: number;
  has_organic: 0 | 1;
  created_at: string;
}

export interface ItemWithVariants extends Item {
  variants: ItemVariant[];
}

export interface CartItem {
  id: string;
  session_id: string;
  item_id: string;
  variant_id: string | null;
  quantity: number;
  notes: string | null;
  added_at: string;
  updated_at: string;
  // Joined fields
  item_name: string;
  unit: string;
  image_url: string | null;
  category_name: string;
  category_icon: string;
  brand: string | null;
  quality_tier: QualityTier | null;
  size: string | null;
  base_price: number | null;
  is_organic: 0 | 1 | null;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  count: number;
}

export type FulfillmentType = 'delivery' | 'pickup';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface Order {
  id: string;
  session_id: string;
  status: OrderStatus;
  fulfillment_type: FulfillmentType;
  fulfillment_address: string | null;
  fulfillment_store: string | null;
  scheduled_at: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  bundle_deal_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  item_id: string;
  variant_id: string | null;
  item_name: string;
  brand: string | null;
  quality_tier: QualityTier | null;
  quantity: number;
  unit_price: number;
  line_total: number;
  notes: string | null;
}

export interface OrderWithItems extends Order {
  items: OrderItem[];
}

export interface BundleDeal {
  id: string;
  name: string;
  provider: string;
  provider_url: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number | null;
  max_savings: number | null;
  valid_from: string | null;
  valid_until: string | null;
  is_active: 0 | 1;
  item_ids: string | null;
  item_names: string | null;
  item_count: number;
  created_at: string;
}

export interface BundleRecommendation extends BundleDeal {
  matched_items: number;
  total_bundle_items: number;
  estimated_savings: number;
  match_percentage: number;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ItemsResponse {
  items: Item[];
  pagination: Pagination;
}

export interface CheckoutFormData {
  fulfillment_type: FulfillmentType;
  fulfillment_address?: string;
  fulfillment_store?: string;
  scheduled_at?: string;
  bundle_deal_id?: string;
  notes?: string;
}
