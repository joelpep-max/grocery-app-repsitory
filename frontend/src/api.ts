import axios from 'axios';
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
} from './types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Categories
export const getCategories = () =>
  api.get<Category[]>('/categories').then(r => r.data);

// Items
export interface ItemFilters {
  category_id?: string;
  search?: string;
  quality_tier?: string;
  is_organic?: boolean;
  page?: number;
  limit?: number;
}

export const getItems = (filters: ItemFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.category_id) params.set('category_id', filters.category_id);
  if (filters.search) params.set('search', filters.search);
  if (filters.quality_tier) params.set('quality_tier', filters.quality_tier);
  if (filters.is_organic) params.set('is_organic', 'true');
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  return api.get<ItemsResponse>(`/items?${params}`).then(r => r.data);
};

export const getItem = (id: string) =>
  api.get<ItemWithVariants>(`/items/${id}`).then(r => r.data);

// Cart
export const getCart = (sessionId: string) =>
  api.get<CartSummary>(`/cart/${sessionId}`).then(r => r.data);

export const addToCart = (
  sessionId: string,
  payload: { item_id: string; variant_id?: string; quantity?: number; notes?: string }
) => api.post<CartItem>(`/cart/${sessionId}/items`, payload).then(r => r.data);

export const updateCartItem = (
  sessionId: string,
  cartItemId: string,
  payload: { quantity?: number; notes?: string; variant_id?: string }
) => api.patch<CartItem>(`/cart/${sessionId}/items/${cartItemId}`, payload).then(r => r.data);

export const removeFromCart = (sessionId: string, cartItemId: string) =>
  api.delete(`/cart/${sessionId}/items/${cartItemId}`).then(r => r.data);

export const clearCart = (sessionId: string) =>
  api.delete(`/cart/${sessionId}`).then(r => r.data);

// Bundle Deals
export const getBundles = () =>
  api.get<BundleDeal[]>('/bundles').then(r => r.data);

export const getRecommendedBundles = (sessionId: string) =>
  api.get<{ bundles: BundleRecommendation[]; cart_total: number }>(
    `/bundles/recommend/${sessionId}`
  ).then(r => r.data);

// Orders
export const getOrders = (sessionId: string) =>
  api.get<Order[]>(`/orders/${sessionId}`).then(r => r.data);

export const getOrder = (sessionId: string, orderId: string) =>
  api.get<OrderWithItems>(`/orders/${sessionId}/${orderId}`).then(r => r.data);

export const createOrder = (sessionId: string, data: CheckoutFormData) =>
  api.post<OrderWithItems>(`/orders/${sessionId}`, data).then(r => r.data);

export const updateOrderStatus = (sessionId: string, orderId: string, status: string) =>
  api.patch<Order>(`/orders/${sessionId}/${orderId}/status`, { status }).then(r => r.data);
