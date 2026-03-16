import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { getCart, updateCartItem, removeFromCart, clearCart, getRecommendedBundles } from '../api';
import type { BundleRecommendation } from '../types';
import clsx from 'clsx';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const sessionId = useAppStore(s => s.sessionId);
  const cart = useAppStore(s => s.cart);
  const setCart = useAppStore(s => s.setCart);

  const [bundles, setBundles] = useState<BundleRecommendation[]>([]);
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getCart(sessionId).then(setCart);
  }, [sessionId]);

  useEffect(() => {
    if (cart && cart.items.length > 0) {
      getRecommendedBundles(sessionId).then(data => setBundles(data.bundles));
    }
  }, [cart, sessionId]);

  const handleQuantityChange = async (cartItemId: string, delta: number, current: number) => {
    const newQty = current + delta;
    setUpdatingId(cartItemId);
    try {
      if (newQty <= 0) {
        await removeFromCart(sessionId, cartItemId);
      } else {
        await updateCartItem(sessionId, cartItemId, { quantity: newQty });
      }
      const updated = await getCart(sessionId);
      setCart(updated);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    setUpdatingId(cartItemId);
    try {
      await removeFromCart(sessionId, cartItemId);
      const updated = await getCart(sessionId);
      setCart(updated);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearCart = async () => {
    if (confirm('Clear all items from cart?')) {
      await clearCart(sessionId);
      const updated = await getCart(sessionId);
      setCart(updated);
      setBundles([]);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-6xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some items to get started!</p>
        <Link
          to="/"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const bundle = bundles.find(b => b.id === selectedBundle);
  const discount = bundle
    ? bundle.discount_type === 'percentage'
      ? (cart.subtotal * bundle.discount_value) / 100
      : bundle.discount_value
    : 0;

  const tax = (cart.subtotal - discount) * 0.08;
  const total = cart.subtotal - discount + tax;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Shopping Cart ({cart.count} item{cart.count !== 1 ? 's' : ''})
        </h1>
        <button
          onClick={handleClearCart}
          className="text-sm text-red-500 hover:text-red-700 font-medium"
        >
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.items.map(item => (
            <div
              key={item.id}
              className={clsx(
                'bg-white rounded-xl border border-gray-100 p-4 transition-opacity',
                updatingId === item.id && 'opacity-50'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-2xl shrink-0">
                  {item.category_icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{item.item_name}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                    {item.brand && <span>{item.brand}</span>}
                    {item.size && <span>· {item.size}</span>}
                    {item.quality_tier && (
                      <span className="capitalize">· {item.quality_tier}</span>
                    )}
                    {item.is_organic === 1 && (
                      <span className="text-green-600">· 🌱 Organic</span>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-gray-400 mt-1 italic">Note: {item.notes}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="font-bold text-gray-900">
                    ${item.base_price != null ? (item.base_price * item.quantity).toFixed(2) : '—'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                      className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="text-xs text-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          {/* Bundle Deals */}
          {bundles.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
                <span>🏷️</span> Bundle Deals Available
              </h3>
              <div className="space-y-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bundle"
                    value=""
                    checked={!selectedBundle}
                    onChange={() => setSelectedBundle(null)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-600">No deal</span>
                </label>
                {bundles.map(b => (
                  <label key={b.id} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="bundle"
                      value={b.id}
                      checked={selectedBundle === b.id}
                      onChange={() => setSelectedBundle(b.id)}
                      className="mt-0.5"
                    />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{b.name}</p>
                      <p className="text-gray-500">{b.provider} · {b.match_percentage}% match</p>
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

          {/* Summary */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
            <h3 className="font-semibold text-gray-900">Order Summary</h3>
            <div className="space-y-2 text-sm">
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
                <span className="text-gray-600">Estimated tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() =>
                navigate('/checkout', {
                  state: { bundleDealId: selectedBundle },
                })
              }
              className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/"
              className="block text-center text-sm text-primary-600 hover:underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
