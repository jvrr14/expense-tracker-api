import type { Handler } from 'hono';
import type { AppEnv } from '../../shared/auth.js';
import { ok } from '../../shared/response.js';
import { getCurrentUserService } from './services.js';

export const getCurrentUserHandler: Handler<AppEnv> = async (c) => {
  const userId = c.get('authenticatedUserId');
  const user = await getCurrentUserService(userId);
  return ok(c, user);
};
