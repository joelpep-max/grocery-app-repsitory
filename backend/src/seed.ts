import { v4 as uuidv4 } from 'uuid';
import db, { initializeDatabase } from './db';

initializeDatabase();

interface Category {
  id: string;
  name: string;
  icon: string;
  sort_order: number;
}

const categories: Category[] = [
  { id: uuidv4(), name: 'Produce', icon: '🥦', sort_order: 1 },
  { id: uuidv4(), name: 'Dairy & Eggs', icon: '🥛', sort_order: 2 },
  { id: uuidv4(), name: 'Meat & Seafood', icon: '🥩', sort_order: 3 },
  { id: uuidv4(), name: 'Bakery', icon: '🍞', sort_order: 4 },
  { id: uuidv4(), name: 'Pantry', icon: '🥫', sort_order: 5 },
  { id: uuidv4(), name: 'Frozen', icon: '🧊', sort_order: 6 },
  { id: uuidv4(), name: 'Beverages', icon: '🥤', sort_order: 7 },
  { id: uuidv4(), name: 'Snacks', icon: '🍿', sort_order: 8 },
  { id: uuidv4(), name: 'Personal Care', icon: '🧴', sort_order: 9 },
  { id: uuidv4(), name: 'Household', icon: '🧹', sort_order: 10 },
];

interface ItemDef {
  name: string;
  description: string;
  unit: string;
  category: string;
  variants: VariantDef[];
}

interface VariantDef {
  brand: string;
  quality_tier: string;
  size: string;
  base_price: number;
  is_organic?: boolean;
}

const itemDefs: ItemDef[] = [
  // Produce
  {
    name: 'Bananas', description: 'Fresh ripe bananas', unit: 'lb', category: 'Produce',
    variants: [
      { brand: 'Dole', quality_tier: 'standard', size: '1 lb', base_price: 0.59 },
      { brand: 'Chiquita', quality_tier: 'premium', size: '1 lb', base_price: 0.79 },
      { brand: 'Local Farm', quality_tier: 'premium', size: '1 lb', base_price: 1.29, is_organic: true },
    ]
  },
  {
    name: 'Apples', description: 'Crisp fresh apples', unit: 'lb', category: 'Produce',
    variants: [
      { brand: 'Washington', quality_tier: 'standard', size: '1 lb', base_price: 1.29 },
      { brand: 'Honeycrisp', quality_tier: 'premium', size: '1 lb', base_price: 2.49 },
      { brand: 'Organic Valley', quality_tier: 'premium', size: '1 lb', base_price: 2.99, is_organic: true },
    ]
  },
  {
    name: 'Spinach', description: 'Fresh baby spinach leaves', unit: 'bag', category: 'Produce',
    variants: [
      { brand: "Earthbound Farm", quality_tier: 'standard', size: '5 oz', base_price: 3.49 },
      { brand: "Taylor Farms", quality_tier: 'standard', size: '5 oz', base_price: 2.99 },
      { brand: "Organic Girl", quality_tier: 'premium', size: '5 oz', base_price: 4.29, is_organic: true },
    ]
  },
  {
    name: 'Tomatoes', description: 'Vine-ripened tomatoes', unit: 'lb', category: 'Produce',
    variants: [
      { brand: 'Roma', quality_tier: 'standard', size: '1 lb', base_price: 1.49 },
      { brand: 'Heirloom', quality_tier: 'premium', size: '1 lb', base_price: 3.99 },
      { brand: 'Cherry', quality_tier: 'standard', size: '1 pint', base_price: 2.49 },
    ]
  },
  {
    name: 'Carrots', description: 'Fresh whole carrots', unit: 'bag', category: 'Produce',
    variants: [
      { brand: 'Grimmway', quality_tier: 'standard', size: '2 lb bag', base_price: 1.29 },
      { brand: 'Bolthouse', quality_tier: 'standard', size: '1 lb bag', base_price: 1.99 },
      { brand: 'Local Organic', quality_tier: 'premium', size: '1 lb bag', base_price: 2.79, is_organic: true },
    ]
  },
  // Dairy & Eggs
  {
    name: 'Whole Milk', description: 'Fresh whole milk', unit: 'gallon', category: 'Dairy & Eggs',
    variants: [
      { brand: "Horizon", quality_tier: 'standard', size: '1 gallon', base_price: 3.99 },
      { brand: "Organic Valley", quality_tier: 'premium', size: '1 gallon', base_price: 6.49, is_organic: true },
      { brand: "Store Brand", quality_tier: 'budget', size: '1 gallon', base_price: 2.99 },
    ]
  },
  {
    name: 'Large Eggs', description: 'Grade A large eggs', unit: 'dozen', category: 'Dairy & Eggs',
    variants: [
      { brand: 'Store Brand', quality_tier: 'budget', size: '12 ct', base_price: 2.49 },
      { brand: 'Cage Free', quality_tier: 'standard', size: '12 ct', base_price: 4.29 },
      { brand: 'Pete & Gerry\'s', quality_tier: 'premium', size: '12 ct', base_price: 6.99, is_organic: true },
    ]
  },
  {
    name: 'Cheddar Cheese', description: 'Sharp cheddar cheese', unit: 'block', category: 'Dairy & Eggs',
    variants: [
      { brand: 'Kraft', quality_tier: 'standard', size: '8 oz', base_price: 3.49 },
      { brand: 'Tillamook', quality_tier: 'premium', size: '8 oz', base_price: 5.29 },
      { brand: 'Cabot', quality_tier: 'premium', size: '8 oz', base_price: 4.99 },
    ]
  },
  {
    name: 'Greek Yogurt', description: 'Creamy Greek yogurt', unit: 'container', category: 'Dairy & Eggs',
    variants: [
      { brand: 'Chobani', quality_tier: 'standard', size: '32 oz', base_price: 5.49 },
      { brand: 'Fage', quality_tier: 'premium', size: '32 oz', base_price: 6.99 },
      { brand: 'Siggi\'s', quality_tier: 'premium', size: '24 oz', base_price: 7.49 },
    ]
  },
  // Meat & Seafood
  {
    name: 'Chicken Breast', description: 'Boneless skinless chicken breast', unit: 'lb', category: 'Meat & Seafood',
    variants: [
      { brand: 'Tyson', quality_tier: 'standard', size: '1 lb', base_price: 4.99 },
      { brand: 'Perdue', quality_tier: 'standard', size: '1 lb', base_price: 5.49 },
      { brand: 'Bell & Evans', quality_tier: 'premium', size: '1 lb', base_price: 8.99, is_organic: true },
    ]
  },
  {
    name: 'Ground Beef', description: '80/20 ground beef', unit: 'lb', category: 'Meat & Seafood',
    variants: [
      { brand: 'Store Brand', quality_tier: 'budget', size: '1 lb', base_price: 5.49 },
      { brand: 'Laura\'s Lean', quality_tier: 'standard', size: '1 lb', base_price: 7.99 },
      { brand: 'Grass Fed', quality_tier: 'premium', size: '1 lb', base_price: 9.99 },
    ]
  },
  {
    name: 'Salmon Fillet', description: 'Atlantic salmon fillet', unit: 'lb', category: 'Meat & Seafood',
    variants: [
      { brand: 'Farm Raised', quality_tier: 'standard', size: '1 lb', base_price: 8.99 },
      { brand: 'Wild Caught', quality_tier: 'premium', size: '1 lb', base_price: 14.99 },
      { brand: 'Organic Wild', quality_tier: 'premium', size: '1 lb', base_price: 18.99, is_organic: true },
    ]
  },
  // Bakery
  {
    name: 'Sandwich Bread', description: 'Soft sandwich bread loaf', unit: 'loaf', category: 'Bakery',
    variants: [
      { brand: 'Wonder', quality_tier: 'budget', size: '20 oz', base_price: 2.49 },
      { brand: 'Dave\'s Killer Bread', quality_tier: 'premium', size: '27 oz', base_price: 5.99 },
      { brand: 'Nature\'s Own', quality_tier: 'standard', size: '20 oz', base_price: 3.49 },
    ]
  },
  {
    name: 'Bagels', description: 'Fresh baked bagels', unit: 'pack', category: 'Bakery',
    variants: [
      { brand: "Thomas'", quality_tier: 'standard', size: '6 ct', base_price: 3.99 },
      { brand: "Pepperidge Farm", quality_tier: 'premium', size: '6 ct', base_price: 5.49 },
      { brand: "Fresh Bakery", quality_tier: 'premium', size: '6 ct', base_price: 6.99 },
    ]
  },
  // Pantry
  {
    name: 'Pasta', description: 'Dry pasta', unit: 'box', category: 'Pantry',
    variants: [
      { brand: 'Barilla', quality_tier: 'standard', size: '16 oz', base_price: 1.79 },
      { brand: 'De Cecco', quality_tier: 'premium', size: '16 oz', base_price: 2.99 },
      { brand: 'Banza Chickpea', quality_tier: 'premium', size: '12 oz', base_price: 3.99 },
    ]
  },
  {
    name: 'Canned Tomatoes', description: 'Whole peeled canned tomatoes', unit: 'can', category: 'Pantry',
    variants: [
      { brand: 'Hunt\'s', quality_tier: 'budget', size: '28 oz', base_price: 1.29 },
      { brand: 'Muir Glen', quality_tier: 'standard', size: '28 oz', base_price: 2.99, is_organic: true },
      { brand: 'San Marzano', quality_tier: 'premium', size: '28 oz', base_price: 4.49 },
    ]
  },
  {
    name: 'Olive Oil', description: 'Extra virgin olive oil', unit: 'bottle', category: 'Pantry',
    variants: [
      { brand: 'Bertolli', quality_tier: 'standard', size: '17 oz', base_price: 7.99 },
      { brand: 'California Olive Ranch', quality_tier: 'premium', size: '16.9 oz', base_price: 11.99 },
      { brand: 'Kirkland', quality_tier: 'standard', size: '2 L', base_price: 19.99 },
    ]
  },
  {
    name: 'Rice', description: 'Long grain white rice', unit: 'bag', category: 'Pantry',
    variants: [
      { brand: 'Store Brand', quality_tier: 'budget', size: '5 lb', base_price: 4.49 },
      { brand: 'Mahatma', quality_tier: 'standard', size: '5 lb', base_price: 5.99 },
      { brand: 'Lundberg', quality_tier: 'premium', size: '2 lb', base_price: 4.99, is_organic: true },
    ]
  },
  // Beverages
  {
    name: 'Orange Juice', description: 'Fresh squeezed orange juice', unit: 'carton', category: 'Beverages',
    variants: [
      { brand: "Tropicana", quality_tier: 'standard', size: '52 oz', base_price: 4.49 },
      { brand: "Simply Orange", quality_tier: 'premium', size: '52 oz', base_price: 5.49 },
      { brand: "Cold Pressed", quality_tier: 'premium', size: '16 oz', base_price: 6.99 },
    ]
  },
  {
    name: 'Coffee', description: 'Ground coffee', unit: 'bag', category: 'Beverages',
    variants: [
      { brand: "Folgers", quality_tier: 'budget', size: '30.5 oz', base_price: 8.99 },
      { brand: "Starbucks Pike Place", quality_tier: 'standard', size: '28 oz', base_price: 13.99 },
      { brand: "Local Roast", quality_tier: 'premium', size: '12 oz', base_price: 14.99 },
    ]
  },
  // Snacks
  {
    name: 'Potato Chips', description: 'Classic potato chips', unit: 'bag', category: 'Snacks',
    variants: [
      { brand: "Lay\'s", quality_tier: 'standard', size: '8 oz', base_price: 3.99 },
      { brand: "Kettle Brand", quality_tier: 'premium', size: '8.5 oz', base_price: 4.49 },
      { brand: "Pringles", quality_tier: 'standard', size: '5.5 oz', base_price: 2.99 },
    ]
  },
  {
    name: 'Granola Bars', description: 'Chewy granola bars', unit: 'box', category: 'Snacks',
    variants: [
      { brand: "Nature Valley", quality_tier: 'standard', size: '12 ct', base_price: 4.49 },
      { brand: "KIND", quality_tier: 'premium', size: '12 ct', base_price: 8.99 },
      { brand: "RX Bar", quality_tier: 'premium', size: '12 ct', base_price: 15.99 },
    ]
  },
  // Personal Care
  {
    name: 'Shampoo', description: 'Daily use shampoo', unit: 'bottle', category: 'Personal Care',
    variants: [
      { brand: "Pantene", quality_tier: 'standard', size: '12 oz', base_price: 5.99 },
      { brand: "Head & Shoulders", quality_tier: 'standard', size: '12 oz', base_price: 6.49 },
      { brand: "OGX", quality_tier: 'premium', size: '13 oz', base_price: 8.99 },
    ]
  },
  {
    name: 'Toothpaste', description: 'Fluoride toothpaste', unit: 'tube', category: 'Personal Care',
    variants: [
      { brand: "Crest", quality_tier: 'standard', size: '4.6 oz', base_price: 3.99 },
      { brand: "Colgate Total", quality_tier: 'standard', size: '4 oz', base_price: 4.49 },
      { brand: "Sensodyne", quality_tier: 'premium', size: '4 oz', base_price: 6.99 },
    ]
  },
  {
    name: 'Hand Soap', description: 'Liquid hand soap', unit: 'bottle', category: 'Personal Care',
    variants: [
      { brand: "Softsoap", quality_tier: 'budget', size: '11.25 oz', base_price: 2.49 },
      { brand: "Mrs. Meyer\'s", quality_tier: 'premium', size: '12.5 oz', base_price: 5.99 },
      { brand: "Method", quality_tier: 'standard', size: '12 oz', base_price: 4.49 },
    ]
  },
  // Household
  {
    name: 'Paper Towels', description: 'Absorbent paper towels', unit: 'roll', category: 'Household',
    variants: [
      { brand: "Bounty", quality_tier: 'premium', size: '6 rolls', base_price: 9.99 },
      { brand: "Viva", quality_tier: 'standard', size: '6 rolls', base_price: 7.99 },
      { brand: "Store Brand", quality_tier: 'budget', size: '6 rolls', base_price: 5.49 },
    ]
  },
  {
    name: 'Dish Soap', description: 'Concentrated dish washing soap', unit: 'bottle', category: 'Household',
    variants: [
      { brand: "Dawn", quality_tier: 'standard', size: '19.4 oz', base_price: 4.99 },
      { brand: "Seventh Generation", quality_tier: 'premium', size: '19 oz', base_price: 6.49 },
      { brand: "Mrs. Meyer\'s", quality_tier: 'premium', size: '16 oz', base_price: 5.99 },
    ]
  },
  {
    name: 'Laundry Detergent', description: 'Liquid laundry detergent', unit: 'bottle', category: 'Household',
    variants: [
      { brand: "Tide", quality_tier: 'standard', size: '92 oz', base_price: 13.99 },
      { brand: "Arm & Hammer", quality_tier: 'budget', size: '100 oz', base_price: 8.99 },
      { brand: "Seventh Generation", quality_tier: 'premium', size: '90 oz', base_price: 16.99 },
    ]
  },
];

function seed(): void {
  const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  if (existingCategories.count > 0) {
    console.log('Database already seeded. Skipping...');
    return;
  }

  console.log('Seeding database...');

  const insertCategory = db.prepare(
    'INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)'
  );
  const insertItem = db.prepare(
    'INSERT INTO items (id, category_id, name, description, unit) VALUES (?, ?, ?, ?, ?)'
  );
  const insertVariant = db.prepare(
    'INSERT INTO item_variants (id, item_id, brand, quality_tier, size, base_price, is_organic) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const insertBundleDeal = db.prepare(
    'INSERT INTO bundle_deals (id, name, provider, provider_url, discount_type, discount_value, min_order_amount, valid_until) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  );
  const insertBundleDealItem = db.prepare(
    'INSERT INTO bundle_deal_items (bundle_id, item_id) VALUES (?, ?)'
  );

  const seedAll = db.transaction(() => {
    // Insert categories
    const categoryMap = new Map<string, string>();
    for (const cat of categories) {
      insertCategory.run(cat.id, cat.name, cat.icon, cat.sort_order);
      categoryMap.set(cat.name, cat.id);
    }

    // Insert items and variants
    const allItemIds: string[] = [];
    for (const itemDef of itemDefs) {
      const categoryId = categoryMap.get(itemDef.category);
      if (!categoryId) continue;

      const itemId = uuidv4();
      allItemIds.push(itemId);
      insertItem.run(itemId, categoryId, itemDef.name, itemDef.description, itemDef.unit);

      for (const variant of itemDef.variants) {
        insertVariant.run(
          uuidv4(), itemId, variant.brand, variant.quality_tier,
          variant.size, variant.base_price, variant.is_organic ? 1 : 0
        );
      }
    }

    // Seed some bundle deals
    const bundleDeals = [
      {
        id: uuidv4(),
        name: 'Weekly Produce Box',
        provider: 'FreshDirect',
        provider_url: 'https://www.freshdirect.com',
        discount_type: 'percentage',
        discount_value: 15,
        min_order_amount: 30,
        valid_until: '2026-12-31',
        item_indices: [0, 1, 2, 3, 4],
      },
      {
        id: uuidv4(),
        name: 'Breakfast Bundle',
        provider: 'Instacart',
        provider_url: 'https://www.instacart.com',
        discount_type: 'percentage',
        discount_value: 10,
        min_order_amount: 25,
        valid_until: '2026-12-31',
        item_indices: [5, 6, 12, 19],
      },
      {
        id: uuidv4(),
        name: 'Household Essentials',
        provider: 'Amazon Fresh',
        provider_url: 'https://www.amazon.com/fresh',
        discount_type: 'fixed',
        discount_value: 5,
        min_order_amount: 40,
        valid_until: '2026-12-31',
        item_indices: [23, 24, 25, 26],
      },
    ];

    for (const deal of bundleDeals) {
      insertBundleDeal.run(
        deal.id, deal.name, deal.provider, deal.provider_url,
        deal.discount_type, deal.discount_value, deal.min_order_amount, deal.valid_until
      );
      for (const idx of deal.item_indices) {
        if (allItemIds[idx]) {
          insertBundleDealItem.run(deal.id, allItemIds[idx]);
        }
      }
    }
  });

  seedAll();
  console.log(`Seeded ${categories.length} categories and ${itemDefs.length} items.`);
}

seed();
