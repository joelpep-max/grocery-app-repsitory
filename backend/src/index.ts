import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase } from './db';
import categoriesRouter from './routes/categories';
import itemsRouter from './routes/items';
import cartRouter from './routes/cart';
import bundlesRouter from './routes/bundles';
import ordersRouter from './routes/orders';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize DB
initializeDatabase();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : [
      'http://localhost:5173',  // Vite web dev server
      'http://localhost:19006', // Expo web
      'http://localhost:8081',  // Metro bundler
    ];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/items', itemsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/bundles', bundlesRouter);
app.use('/api/orders', ordersRouter);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 404 handler
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Grocery App API running on http://localhost:${PORT}`);
});

export default app;
