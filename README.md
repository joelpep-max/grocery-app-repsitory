# GrocerEase 🛒

> Open source grocery purchase management application — web & mobile

GrocerEase helps you manage grocery purchases end-to-end — from browsing items and comparing quality/brands, to finding the best bundled deals, selecting fulfillment options, and tracking your orders.

## Features

- **Item Catalog** — Browse 25+ common grocery and personal care items across 10 categories (Produce, Dairy & Eggs, Meat & Seafood, Bakery, Pantry, Frozen, Beverages, Snacks, Personal Care, Household)
- **Smart Cart** — Add items with quantity and special notes
- **Brand & Quality Preferences** — Each item offers multiple variants with brand, quality tier (Budget / Standard / Premium), size, and organic options
- **Bundle Deal Discovery** — Compare bundled purchase deals across providers (FreshDirect, Instacart, Amazon Fresh, etc.) to maximize savings
- **Fulfillment Options** — Choose delivery (with address) or pickup (with store selection), with optional scheduling
- **Transaction Management** — Full order history with status tracking (Pending → Confirmed → Processing → Ready → Delivered)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Web Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Mobile App | React Native (Expo), TypeScript, React Navigation, Zustand |
| Shared | `@grocery-app/shared` — TypeScript types + API client (used by both web and mobile) |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (via better-sqlite3) |
| Package Management | npm workspaces (monorepo) |

## Project Structure

```
grocery-app/
├── packages/
│   └── shared/           # @grocery-app/shared — types + API client
│       └── src/
│           ├── types.ts  # All domain interfaces
│           ├── api.ts    # Configurable Axios API client
│           └── index.ts
├── backend/              # Express REST API
│   ├── src/
│   │   ├── db.ts         # Database setup & schema
│   │   ├── seed.ts       # Sample data seeder
│   │   ├── index.ts      # App entry point
│   │   └── routes/       # categories, items, cart, bundles, orders
│   └── data/             # SQLite database (gitignored)
├── frontend/             # React web SPA
│   └── src/
│       ├── types.ts      # Re-exports from @grocery-app/shared
│       ├── api.ts        # Configures shared API + re-exports
│       ├── store.ts      # Zustand state (localStorage)
│       ├── components/   # Layout, ItemCard, CategorySidebar, etc.
│       └── pages/        # ShopPage, CartPage, CheckoutPage, etc.
└── mobile/               # Expo React Native app (iOS & Android)
    ├── App.tsx           # Entry point
    ├── metro.config.js   # Monorepo-aware Metro bundler config
    └── src/
        ├── config.ts     # API base URL (platform-aware)
        ├── theme.ts      # Design tokens (colors, spacing, typography)
        ├── store.ts      # Zustand state (AsyncStorage)
        ├── navigation/   # Bottom tab + stack navigators
        ├── screens/      # ShopScreen, CartScreen, CheckoutScreen, etc.
        └── components/   # ItemCard, CartItemRow, BundleCard, etc.
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- **Mobile**: Expo CLI (`npm install -g expo-cli`), Xcode (iOS) or Android Studio (Android)

### Installation

```bash
# Install all dependencies (root + all workspaces)
npm install

# Seed the database with sample items (one-time)
npm run seed --workspace=backend
```

### Development — Web

```bash
# Run backend API + web frontend concurrently
npm run dev

# Or individually:
npm run dev --workspace=backend   # API on http://localhost:3001
npm run dev --workspace=frontend  # Web app on http://localhost:5173
```

### Development — Mobile

```bash
# Start Expo dev server
npm run dev:mobile

# Then press:
#   i — open in iOS Simulator
#   a — open in Android Emulator
#   w — open in web browser
```

> **Note:** The mobile app connects to the backend at `http://localhost:3001` (iOS) or `http://10.0.2.2:3001` (Android emulator). Set the `EXPO_PUBLIC_API_URL` environment variable to point at a deployed backend.

### Build for Production

```bash
# Web
npm run build

# Mobile (requires EAS CLI: npm install -g eas-cli)
eas build --platform android
eas build --platform ios
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| GET | `/api/items` | List items (filter by category, search, quality, organic) |
| GET | `/api/items/:id` | Get item with all variants |
| GET | `/api/cart/:sessionId` | Get cart contents |
| POST | `/api/cart/:sessionId/items` | Add item to cart |
| PATCH | `/api/cart/:sessionId/items/:id` | Update cart item |
| DELETE | `/api/cart/:sessionId/items/:id` | Remove from cart |
| GET | `/api/bundles` | List active bundle deals |
| GET | `/api/bundles/recommend/:sessionId` | Get deal recommendations for cart |
| GET | `/api/orders/:sessionId` | List orders |
| POST | `/api/orders/:sessionId` | Create order from cart |
| PATCH | `/api/orders/:sessionId/:id/status` | Update order status |

## Contributing

Contributions are welcome! Please open an issue to discuss features or bug fixes before submitting a PR.

## License

MIT
