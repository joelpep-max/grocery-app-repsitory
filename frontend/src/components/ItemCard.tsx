import React, { useState } from 'react';
import type { Item } from '../types';
import { useAppStore } from '../store';
import { addToCart, getCart } from '../api';
import ItemDetailModal from './ItemDetailModal';
import clsx from 'clsx';

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  const [showDetail, setShowDetail] = useState(false);
  const [adding, setAdding] = useState(false);
  const sessionId = useAppStore(s => s.sessionId);
  const setCart = useAppStore(s => s.setCart);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(sessionId, { item_id: item.id, quantity: 1 });
      const cart = await getCart(sessionId);
      setCart(cart);
    } catch (err) {
      console.error('Failed to add item', err);
    } finally {
      setAdding(false);
    }
  };

  const priceDisplay = item.min_price != null
    ? item.min_price === item.max_price
      ? `$${item.min_price.toFixed(2)}`
      : `$${item.min_price.toFixed(2)} – $${item.max_price!.toFixed(2)}`
    : 'Price varies';

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer group"
        onClick={() => setShowDetail(true)}
      >
        {/* Image placeholder */}
        <div className="h-32 bg-gradient-to-br from-primary-50 to-green-100 rounded-t-xl flex items-center justify-center text-5xl">
          {item.category_icon}
        </div>

        <div className="p-3">
          {/* Category & badges */}
          <div className="flex items-center gap-1 mb-1">
            <span className="text-xs text-gray-500">{item.category_name}</span>
            {item.has_organic === 1 && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">
                Organic
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-0.5">
            {item.name}
          </h3>
          {item.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
          )}

          <div className="flex items-center justify-between mt-2">
            <div>
              <span className="font-bold text-primary-700">{priceDisplay}</span>
              <span className="text-xs text-gray-400 ml-1">/ {item.unit}</span>
            </div>
            <button
              onClick={handleQuickAdd}
              disabled={adding}
              className={clsx(
                'text-sm px-3 py-1.5 rounded-lg font-medium transition-all',
                adding
                  ? 'bg-gray-100 text-gray-400 cursor-wait'
                  : 'bg-primary-600 text-white hover:bg-primary-700 active:scale-95'
              )}
            >
              {adding ? '...' : '+ Add'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-1">
            {item.variant_count} variant{item.variant_count !== 1 ? 's' : ''} available
          </p>
        </div>
      </div>

      {showDetail && (
        <ItemDetailModal item={item} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
};

export default ItemCard;
