// Configure shared API client to use Vite's /api proxy, then re-export everything
import { configure } from '@grocery-app/shared';
configure({ baseURL: '/api' });
export * from '@grocery-app/shared';
