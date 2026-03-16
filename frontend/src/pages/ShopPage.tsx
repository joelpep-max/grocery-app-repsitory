import React, { useEffect, useState, useCallback } from 'react';
import { useAppStore } from '../store';
import { getCategories, getItems, getCart } from '../api';
import type { Item, Pagination } from '../types';
import CategorySidebar from '../components/CategorySidebar';
import ItemCard from '../components/ItemCard';

const ShopPage: React.FC = () => {
  const {
    sessionId, categories, selectedCategory, searchQuery,
    setCategories, setSelectedCategory, setSearchQuery, setCart, setCartLoading,
  } = useAppStore();

  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterQuality, setFilterQuality] = useState('');

  // Load categories & initial cart on mount
  useEffect(() => {
    if (categories.length === 0) {
      getCategories().then(setCategories);
    }
    setCartLoading(true);
    getCart(sessionId)
      .then(setCart)
      .finally(() => setCartLoading(false));
  }, [sessionId]);

  const loadItems = useCallback(() => {
    setLoading(true);
    getItems({
      category_id: selectedCategory || undefined,
      search: searchQuery || undefined,
      quality_tier: filterQuality || undefined,
      is_organic: filterOrganic || undefined,
      page,
      limit: 24,
    }).then(data => {
      setItems(data.items);
      setPagination(data.pagination);
    }).finally(() => setLoading(false));
  }, [selectedCategory, searchQuery, filterOrganic, filterQuality, page]);

  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery, filterOrganic, filterQuality]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <div className="flex gap-6">
      <CategorySidebar
        categories={categories}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="flex-1 min-w-0">
        {/* Search & Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="flex-1 min-w-48 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <select
            value={filterQuality}
            onChange={e => setFilterQuality(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
          >
            <option value="">All Quality</option>
            <option value="budget">Budget</option>
            <option value="standard">Standard</option>
            <option value="premium">Premium</option>
          </select>

          <button
            onClick={() => setFilterOrganic(!filterOrganic)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
              filterOrganic
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
            }`}
          >
            🌱 Organic
          </button>

          {(searchQuery || selectedCategory || filterOrganic || filterQuality) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterOrganic(false);
                setFilterQuality('');
                setSelectedCategory(null);
              }}
              className="px-4 py-2.5 rounded-xl text-sm text-gray-600 border border-gray-300 hover:bg-gray-50"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results count */}
        {pagination && (
          <p className="text-sm text-gray-500 mb-4">
            {pagination.total === 0 ? 'No items found' : (
              <>Showing <strong>{items.length}</strong> of <strong>{pagination.total}</strong> items</>
            )}
          </p>
        )}

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm h-52 animate-pulse">
                <div className="h-32 bg-gray-200 rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-lg font-medium text-gray-700">No items found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map(item => <ItemCard key={item.id} item={item} />)}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ShopPage;
