import axios, { AxiosInstance } from 'axios';
import type {
  Category,
  ItemsResponse,
  ItemWithVariants,
  CartSummary,
  CartItem,
  BundleDeal,
  BundleRecommendation,
  Order,
  OrderWithItems,
  CheckoutFormData,
  ItemFilters,
} from './types';

let _baseURL = '/api';

export function configure(opts: { baseURL: string }): void {
  _baseURL = opts.baseURL;
  _client = null; // reset cached client
}

let _client: AxiosInstance | null = null;

function client(): AxiosInstance {
  if (!_client) {
    _client = axios.create({
      baseURL: _baseURL,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return _client;
}

// Categories
export const getCategories = (): Promise<Category[]> =>
  client().get<Category[]>('/categories').then(r => r.data);

// Items
export const getItems = (filters: ItemFilters = {}): Promise<ItemsResponse> => {
  const params = new URLSearchParams();
  if (filters.category_id) params.set('category_id', filters.category_id);
  if (filters.search) params.set('search', filters.search);
  if (filters.quality_tier) params.set('quality_tier', filters.quality_tier);
  if (filters.is_organic) params.set('is_organic', 'true');
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  return client().get<ItemsResponse>(`/items?${params}`).then(r => r.data);
};

export const getItem = (id: string): Promise<ItemWithVariants> =>
  client().get<ItemWithVariants>(`/items/${id}`).then(r => r.data);

// Cart
export const getCart = (sessionId: string): Promise<CartSummary> =>
  client().get<CartSummary>(`/cart/${sessionId}`).then(r => r.data);

export const addToCart = (
  sessionId: string,
  payload: { item_id: string; variant_id?: string; quantity?: number; notes?: string }
): Promise<CartItem> =>
  client().post<CartItem>(`/cart/${sessionId}/items`, payload).then(r => r.data);

export const updateCartItem = (
  sessionId: string,
  cartItemId: string,
  payload: { quantity?: number; notes?: string; variant_id?: string }
): Promise<CartItem> =>
  client().patch<CartItem>(`/cart/${sessionId}/items/${cartItemId}`, payload).then(r => r.data);

export const removeFromCart = (sessionId: string, cartItemId: string): Promise<void> =>
  client().delete(`/cart/${sessionId}/items/${cartItemId}`).then(r => r.data);

export const clearCart = (sessionId: string): Promise<void> =>
  client().delete(`/cart/${sessionId}`).then(r => r.data);

// Bundle Deals
export const getBundles = (): Promise<BundleDeal[]> =>
  client().get<BundleDeal[]>('/bundles').then(r => r.data);

export const getRecommendedBundles = (
  sessionId: string
): Promise<{ bundles: BundleRecommendation[]; cart_total: number }> =>
  client()
    .get<{ bundles: BundleRecommendation[]; cart_total: number }>(
      `/bundles/recommend/${sessionId}`
    )
    .then(r => r.data);

// Orders
export const getOrders = (sessionId: string): Promise<Order[]> =>
  client().get<Order[]>(`/orders/${sessionId}`).then(r => r.data);

export const getOrder = (sessionId: string, orderId: string): Promise<OrderWithItems> =>
  client().get<OrderWithItems>(`/orders/${sessionId}/${orderId}`).then(r => r.data);

export const createOrder = (
  sessionId: string,
  data: CheckoutFormData
): Promise<OrderWithItems> =>
  client().post<OrderWithItems>(`/orders/${sessionId}`, data).then(r => r.data);

export const updateOrderStatus = (
  sessionId: string,
  orderId: string,
  status: string
): Promise<Order> =>
  client().patch<Order>(`/orders/${sessionId}/${orderId}/status`, { status }).then(r => r.data);
