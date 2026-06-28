import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { AppError } from './shared/errors.js';
import { authRoutes } from './modules/auth/routes.js';

export function createApp() {
  const app = new Hono();

  app.use(logger());
  app.use(cors());
  app.use(secureHeaders());

  app.route('/auth', authRoutes);

  app.get('/health', (c) =>
    c.json({ status: 'ok', timestamp: new Date().toISOString() }),
  );

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(
        { success: false, error: { code: err.code, message: err.message } },
        err.statusCode as Parameters<typeof c.json>[1],
      );
    }

    console.error(err);
    return c.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      500,
    );
  });

  app.notFound((c) =>
    c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404),
  );

  return app;
}
