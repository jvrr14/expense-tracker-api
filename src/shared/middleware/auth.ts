import { every } from 'hono/combine';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { jwt } from 'hono/jwt';
import type { MiddlewareHandler } from 'hono';
import { env } from '../../config/env.js';
import {
  accessTokenPayloadSchema,
  JWT_ALGORITHM,
  type AppEnv,
} from '../auth.js';

const validateAccessTokenClaims = createMiddleware<AppEnv>(async (c, next) => {
  const result = accessTokenPayloadSchema.safeParse(c.get('jwtPayload'));

  if (!result.success) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  c.set('authenticatedUserId', result.data.sub);
  await next();
});

export const authMiddleware: MiddlewareHandler<AppEnv> = every(
  jwt({ secret: env.JWT_SECRET, alg: JWT_ALGORITHM }),
  validateAccessTokenClaims,
);
