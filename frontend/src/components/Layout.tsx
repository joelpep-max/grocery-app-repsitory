import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const cart = useAppStore(s => s.cart);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary-700">
              <span className="text-2xl">🛒</span>
              <span>GrocerEase</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-6">
              <NavLink to="/" label="Shop" current={location.pathname === '/'} />
              <NavLink to="/orders" label="Orders" current={location.pathname.startsWith('/orders')} />
              <NavLink to="/deals" label="Deals" current={location.pathname === '/deals'} />
            </nav>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              <span>🛒</span>
              <span>Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6 text-center text-sm text-gray-500">
        <p>GrocerEase &mdash; Open source grocery management</p>
        <a
          href="https://github.com/joelpep-max/grocery-app-repsitory"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-600 hover:underline"
        >
          View on GitHub
        </a>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{ to: string; label: string; current: boolean }> = ({ to, label, current }) => (
  <Link
    to={to}
    className={`font-medium transition-colors ${
      current
        ? 'text-primary-700 border-b-2 border-primary-700'
        : 'text-gray-600 hover:text-primary-700'
    }`}
  >
    {label}
  </Link>
);

export default Layout;
