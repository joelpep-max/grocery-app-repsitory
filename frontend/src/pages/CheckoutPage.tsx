import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { createOrder, getCart, getRecommendedBundles } from '../api';
import type { FulfillmentType, BundleRecommendation } from '../types';

const STORES = [
  'Downtown Market - 123 Main St',
  'Eastside Fresh - 456 Oak Ave',
  'Westfield Grocery - 789 Pine Rd',
  'Northgate Market - 321 Elm St',
];

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const sessionId = useAppStore(s => s.sessionId);
  const cart = useAppStore(s => s.cart);
  const setCart = useAppStore(s => s.setCart);

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [address, setAddress] = useState('');
  const [store, setStore] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedBundle, setSelectedBundle] = useState<string>(location.state?.bundleDealId || '');
  const [bundles, setBundles] = useState<BundleRecommendation[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!cart) {
      getCart(sessionId).then(setCart);
    }
    getRecommendedBundles(sessionId).then(data => setBundles(data.bundles));
  }, [sessionId]);

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const selectedBundleObj = bundles.find(b => b.id === selectedBundle);
  const discount = selectedBundleObj
    ? selectedBundleObj.discount_type === 'percentage'
      ? (cart.subtotal * selectedBundleObj.discount_value) / 100
      : selectedBundleObj.discount_value
    : 0;
  const tax = (cart.subtotal - discount) * 0.08;
  const total = cart.subtotal - discount + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (fulfillmentType === 'delivery' && !address.trim()) {
      setError('Please enter a delivery address.');
      return;
    }
    if (fulfillmentType === 'pickup' && !store) {
      setError('Please select a pickup store.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder(sessionId, {
        fulfillment_type: fulfillmentType,
        fulfillment_address: fulfillmentType === 'delivery' ? address : undefined,
        fulfillment_store: fulfillmentType === 'pickup' ? store : undefined,
        scheduled_at: scheduledAt || undefined,
        bundle_deal_id: selectedBundle || undefined,
        notes: notes || undefined,
      });

      // Refresh cart (should be empty now)
      const updatedCart = await getCart(sessionId);
      setCart(updatedCart);

      navigate(`/orders/${order.id}`, { state: { order } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to place order. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fulfillment Type */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Fulfillment Preference</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFulfillmentType('delivery')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                fulfillmentType === 'delivery'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <p className="text-2xl mb-1">🚚</p>
              <p className="font-semibold text-gray-900">Delivery</p>
              <p className="text-xs text-gray-500 mt-0.5">Delivered to your door</p>
            </button>
            <button
              type="button"
              onClick={() => setFulfillmentType('pickup')}
              className={`p-4 rounded-xl border-2 text-center transition-all ${
                fulfillmentType === 'pickup'
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-primary-300'
              }`}
            >
              <p className="text-2xl mb-1">🏪</p>
              <p className="font-semibold text-gray-900">Pickup</p>
              <p className="text-xs text-gray-500 mt-0.5">Pick up at store</p>
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {fulfillmentType === 'delivery' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address *
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State ZIP"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Pickup Store *
                </label>
                <select
                  value={store}
                  onChange={e => setStore(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                >
                  <option value="">Select a store...</option>
                  {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled Date & Time (optional)
              </label>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={e => setScheduledAt(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>
        </div>

        {/* Bundle Deals */}
        {bundles.length > 0 && (
          <div className="bg-white rounded-xl border p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Apply Bundle Deal</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="checkout-bundle"
                  value=""
                  checked={!selectedBundle}
                  onChange={() => setSelectedBundle('')}
                />
                <span className="text-sm text-gray-600">No deal</span>
              </label>
              {bundles.map(b => (
                <label key={b.id} className="flex items-start gap-2 cursor-pointer p-2 rounded-lg hover:bg-amber-50">
                  <input
                    type="radio"
                    name="checkout-bundle"
                    value={b.id}
                    checked={selectedBundle === b.id}
                    onChange={() => setSelectedBundle(b.id)}
                    className="mt-0.5"
                  />
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{b.name}</p>
                    <p className="text-gray-500">{b.provider}</p>
                    <p className="text-green-600 font-medium">
                      Save ${b.estimated_savings.toFixed(2)}
                      {b.discount_type === 'percentage' ? ` (${b.discount_value}% off)` : ''}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Order Notes */}
        <div className="bg-white rounded-xl border p-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any special instructions for your order..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
            rows={3}
          />
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-1.5 text-sm">
            {cart.items.map(item => (
              <div key={item.id} className="flex justify-between text-gray-700">
                <span>
                  {item.item_name}
                  {item.brand ? ` (${item.brand})` : ''}
                  {item.quantity > 1 && ` ×${item.quantity}`}
                </span>
                <span>${item.base_price != null ? (item.base_price * item.quantity).toFixed(2) : '—'}</span>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Bundle discount</span>
                  <span>- ${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Placing Order...' : `Place Order · $${total.toFixed(2)}`}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
