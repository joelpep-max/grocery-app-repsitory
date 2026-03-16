import React from 'react';
import clsx from 'clsx';
import type { Category } from '../types';

interface Props {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const CategorySidebar: React.FC<Props> = ({ categories, selectedId, onSelect }) => {
  return (
    <aside className="w-56 shrink-0">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Categories
      </h2>
      <nav className="space-y-1">
        <button
          onClick={() => onSelect(null)}
          className={clsx(
            'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedId === null
              ? 'bg-primary-100 text-primary-800'
              : 'text-gray-700 hover:bg-gray-100'
          )}
        >
          <span>🏪</span>
          <span>All Items</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={clsx(
              'w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedId === cat.id
                ? 'bg-primary-100 text-primary-800'
                : 'text-gray-700 hover:bg-gray-100'
            )}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default CategorySidebar;
