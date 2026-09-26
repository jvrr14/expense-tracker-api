import { Hono } from 'hono';
import type { AppEnv } from '../../shared/auth.js';
import { authMiddleware } from '../../shared/middleware/auth.js';
import { getCurrentUserHandler } from './handlers.js';

const currentUserRoutes = new Hono<AppEnv>();

currentUserRoutes.get('/', authMiddleware, getCurrentUserHandler);

export { currentUserRoutes };
