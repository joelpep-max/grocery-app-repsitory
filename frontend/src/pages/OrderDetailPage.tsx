import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { getOrder } from '../api';
import type { OrderWithItems, OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800', icon: '⚙️' },
  ready: { label: 'Ready', color: 'bg-teal-100 text-teal-800', icon: '📦' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

const statusSteps: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered'];

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const location = useLocation();
  const sessionId = useAppStore(s => s.sessionId);
  const [order, setOrder] = useState<OrderWithItems | null>(location.state?.order || null);
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (orderId && !order) {
      getOrder(sessionId, orderId)
        .then(setOrder)
        .finally(() => setLoading(false));
    }
  }, [orderId, sessionId]);

  if (loading) {
    return <div className="text-center py-16"><p className="text-gray-500">Loading order...</p></div>;
  }

  if (!order) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-700">Order not found.</p>
        <Link to="/orders" className="text-primary-600 hover:underline mt-2 block">Back to orders</Link>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;
  const currentStep = statusSteps.indexOf(order.status);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back link */}
      <Link to="/orders" className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4">
        ← Back to orders
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Placed {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              {statusSteps.map((step, i) => (
                <div
                  key={step}
                  className={`flex-1 text-center ${i <= currentStep ? 'text-primary-600 font-medium' : ''}`}
                >
                  {statusConfig[step].icon}
                </div>
              ))}
            </div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div
                className="absolute h-2 bg-primary-500 rounded-full transition-all"
                style={{ width: `${Math.max(4, (currentStep / (statusSteps.length - 1)) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Fulfillment Details */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Fulfillment Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-500 w-28 shrink-0">Type:</span>
            <span className="font-medium">
              {order.fulfillment_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
            </span>
          </div>
          {order.fulfillment_address && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Address:</span>
              <span>{order.fulfillment_address}</span>
            </div>
          )}
          {order.fulfillment_store && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Store:</span>
              <span>{order.fulfillment_store}</span>
            </div>
          )}
          {order.scheduled_at && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Scheduled:</span>
              <span>{new Date(order.scheduled_at).toLocaleString()}</span>
            </div>
          )}
          {order.notes && (
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">Notes:</span>
              <span className="italic">{order.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-xl border p-5 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3">Items ({order.items.length})</h2>
        <div className="space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-start justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium text-gray-900">{item.item_name}</p>
                <div className="text-xs text-gray-500 mt-0.5 flex gap-1.5">
                  {item.brand && <span>{item.brand}</span>}
                  {item.quality_tier && <span>· {item.quality_tier}</span>}
                </div>
                {item.notes && <p className="text-xs text-gray-400 italic mt-0.5">{item.notes}</p>}
              </div>
              <div className="text-right text-sm">
                <p className="text-gray-600">×{item.quantity} @ ${item.unit_price.toFixed(2)}</p>
                <p className="font-semibold text-gray-900">${item.line_total.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Payment Summary</h2>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount_amount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Bundle discount</span>
              <span>- ${order.discount_amount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tax</span>
            <span>${order.tax_amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-base border-t pt-2">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/"
          className="flex-1 text-center bg-primary-600 text-white py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          to="/orders"
          className="flex-1 text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
        >
          View All Orders
        </Link>
      </div>
    </div>
  );
};

export default OrderDetailPage;
