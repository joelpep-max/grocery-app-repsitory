# GrocerEase 🛒

> Open source grocery purchase management application

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
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (via better-sqlite3) |
| Package Management | npm workspaces (monorepo) |

## Project Structure

```
grocery-app/
├── backend/              # Express REST API
│   ├── src/
│   │   ├── db.ts         # Database setup & schema
│   │   ├── seed.ts       # Sample data seeder
│   │   ├── index.ts      # App entry point
│   │   └── routes/
│   │       ├── categories.ts
│   │       ├── items.ts
│   │       ├── cart.ts
│   │       ├── bundles.ts
│   │       └── orders.ts
│   └── data/             # SQLite database (gitignored)
│
└── frontend/             # React SPA
    └── src/
        ├── components/   # Reusable UI components
        ├── pages/        # Route-level pages
        ├── api.ts        # API client
        ├── store.ts      # Global state (Zustand)
        └── types.ts      # TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies (root + workspaces)
npm install

# Seed the database with sample items
npm run seed --workspace=backend
```

### Development

```bash
# Run backend and frontend concurrently
npm run dev

# Or run individually:
npm run dev --workspace=backend   # API on http://localhost:3001
npm run dev --workspace=frontend  # UI on http://localhost:5173
```

### Build for Production

```bash
npm run build
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
