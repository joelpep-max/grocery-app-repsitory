import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store';
import { getOrders } from '../api';
import type { Order, OrderStatus } from '../types';

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
  processing: { label: 'Processing', color: 'bg-indigo-100 text-indigo-800', icon: '⚙️' },
  ready: { label: 'Ready', color: 'bg-teal-100 text-teal-800', icon: '📦' },
  out_for_delivery: { label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800', icon: '🚚' },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' },
};

const OrdersPage: React.FC = () => {
  const sessionId = useAppStore(s => s.sessionId);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(sessionId)
      .then(setOrders)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">📋</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
        <p className="text-gray-500 mb-6">Your order history will appear here.</p>
        <Link
          to="/"
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order History</h1>
      <div className="space-y-4">
        {orders.map(order => {
          const status = statusConfig[order.status] || statusConfig.pending;
          return (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-primary-200 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <p className="font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {order.fulfillment_type === 'delivery' ? '🚚 Delivery' : '🏪 Pickup'}
                    {order.fulfillment_address && ` · ${order.fulfillment_address}`}
                    {order.fulfillment_store && ` · ${order.fulfillment_store}`}
                  </p>
                  {order.scheduled_at && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Scheduled: {new Date(order.scheduled_at).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${status.color}`}>
                    {status.icon} {status.label}
                  </span>
                  <p className="font-bold text-gray-900 text-lg mt-1">${order.total.toFixed(2)}</p>
                  {order.discount_amount > 0 && (
                    <p className="text-xs text-green-600">Saved ${order.discount_amount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
