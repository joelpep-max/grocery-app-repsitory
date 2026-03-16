import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getBundles } from '../api';
import type { BundleDeal } from '../types';

const DealsPage: React.FC = () => {
  const [bundles, setBundles] = useState<BundleDeal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBundles().then(setBundles).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto grid gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Bundle Deals</h1>
        <p className="text-gray-500 mt-1">
          Get the best prices by bundling your purchases from top providers.
        </p>
      </div>

      {bundles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🏷️</p>
          <p className="text-lg font-medium text-gray-700">No deals available right now</p>
          <p className="text-gray-500 text-sm mt-1">Check back soon for bundle savings!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bundles.map(bundle => (
            <div key={bundle.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-gray-900">{bundle.name}</h2>
                    {bundle.discount_type === 'percentage' ? (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        {bundle.discount_value}% OFF
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">
                        ${bundle.discount_value} OFF
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">{bundle.provider}</p>

                  {bundle.min_order_amount && (
                    <p className="text-xs text-gray-500 mt-1">
                      Min. order: ${bundle.min_order_amount.toFixed(2)}
                    </p>
                  )}

                  {bundle.valid_until && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Valid until {new Date(bundle.valid_until).toLocaleDateString()}
                    </p>
                  )}

                  {bundle.item_names && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Includes items:</p>
                      <div className="flex flex-wrap gap-1">
                        {bundle.item_names.split(',').map((name, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                            {name.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="ml-4 text-right">
                  {bundle.provider_url && (
                    <a
                      href={bundle.provider_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline block mb-2"
                    >
                      Visit {bundle.provider} →
                    </a>
                  )}
                  <Link
                    to="/"
                    className="inline-block bg-primary-600 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-primary-50 rounded-xl border border-primary-100 p-5">
        <h3 className="font-semibold text-primary-900 mb-2">💡 How Bundle Deals Work</h3>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• Add qualifying items to your cart</li>
          <li>• Matching deals are automatically suggested at checkout</li>
          <li>• Choose the best deal to maximize your savings</li>
          <li>• Discounts are applied automatically to your order total</li>
        </ul>
      </div>
    </div>
  );
};

export default DealsPage;
