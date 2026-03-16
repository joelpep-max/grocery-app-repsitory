import React, { useEffect, useState } from 'react';
import type { Item, ItemVariant, QualityTier } from '../types';
import { getItem, addToCart, getCart } from '../api';
import { useAppStore } from '../store';
import clsx from 'clsx';

interface Props {
  item: Item;
  onClose: () => void;
}

const qualityLabels: Record<QualityTier, { label: string; color: string }> = {
  budget: { label: 'Budget', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  standard: { label: 'Standard', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  premium: { label: 'Premium', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

const ItemDetailModal: React.FC<Props> = ({ item, onClose }) => {
  const [fullItem, setFullItem] = useState<import('../types').ItemWithVariants | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ItemVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [filterOrganic, setFilterOrganic] = useState(false);
  const [filterQuality, setFilterQuality] = useState<QualityTier | ''>('');

  const sessionId = useAppStore(s => s.sessionId);
  const setCart = useAppStore(s => s.setCart);

  useEffect(() => {
    getItem(item.id).then(data => {
      setFullItem(data);
      // Pre-select cheapest standard variant
      const standard = data.variants.find(v => v.quality_tier === 'standard');
      setSelectedVariant(standard || data.variants[0] || null);
    });
  }, [item.id]);

  const filteredVariants = fullItem?.variants.filter(v => {
    if (filterOrganic && !v.is_organic) return false;
    if (filterQuality && v.quality_tier !== filterQuality) return false;
    return true;
  });

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAdding(true);
    try {
      await addToCart(sessionId, {
        item_id: item.id,
        variant_id: selectedVariant.id,
        quantity,
        notes: notes || undefined,
      });
      const cart = await getCart(sessionId);
      setCart(cart);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <p className="text-xs text-gray-500">{item.category_icon} {item.category_name}</p>
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-5">
          {item.description && (
            <p className="text-gray-600 text-sm">{item.description}</p>
          )}

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center">Filter:</span>
            <button
              onClick={() => setFilterOrganic(!filterOrganic)}
              className={clsx(
                'text-xs px-3 py-1 rounded-full border font-medium transition-colors',
                filterOrganic
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-green-400'
              )}
            >
              🌱 Organic
            </button>
            {(['budget', 'standard', 'premium'] as QualityTier[]).map(tier => (
              <button
                key={tier}
                onClick={() => setFilterQuality(filterQuality === tier ? '' : tier)}
                className={clsx(
                  'text-xs px-3 py-1 rounded-full border font-medium transition-colors',
                  filterQuality === tier
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-primary-400'
                )}
              >
                {qualityLabels[tier].label}
              </button>
            ))}
          </div>

          {/* Variants */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Choose Brand & Quality
            </p>
            {!fullItem ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredVariants && filteredVariants.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No variants match your filters.</p>
            ) : (
              <div className="space-y-2">
                {filteredVariants?.map(variant => {
                  const ql = qualityLabels[variant.quality_tier];
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={clsx(
                        'w-full text-left p-3 rounded-xl border-2 transition-all',
                        isSelected
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSelected && <span className="text-primary-600">✓</span>}
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {variant.brand || 'Generic'}
                              {variant.size && (
                                <span className="text-gray-500 font-normal ml-1">({variant.size})</span>
                              )}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={clsx('text-xs px-2 py-0.5 rounded-full border', ql.color)}>
                                {ql.label}
                              </span>
                              {variant.is_organic === 1 && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                  🌱 Organic
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-primary-700 text-lg">
                          ${variant.base_price.toFixed(2)}
                          <span className="text-xs font-normal text-gray-500 ml-0.5">/{item.unit}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
              >
                -
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 font-bold"
              >
                +
              </button>
            </div>
            {selectedVariant && (
              <span className="text-sm text-gray-600 ml-auto">
                Total: <span className="font-bold text-gray-900">
                  ${(selectedVariant.base_price * quantity).toFixed(2)}
                </span>
              </span>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Special notes / preferences
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g., Ripe but not overripe, no substitutions..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none"
              rows={2}
            />
          </div>

          {/* Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || adding || added}
            className={clsx(
              'w-full py-3 rounded-xl font-bold text-white transition-all text-base',
              added
                ? 'bg-green-500'
                : selectedVariant && !adding
                ? 'bg-primary-600 hover:bg-primary-700 active:scale-98'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            {added ? '✓ Added to Cart!' : adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
