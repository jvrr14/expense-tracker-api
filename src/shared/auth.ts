import type { JwtVariables } from 'hono/jwt';
import { z } from 'zod';

export const JWT_ALGORITHM = 'HS256' as const;
export const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;

export const accessTokenPayloadSchema = z
  .object({
    sub: z.uuid(),
    iat: z.number().int().nonnegative(),
    exp: z.number().int().positive(),
  })
  .refine((payload) => payload.exp > payload.iat, {
    message: 'Token expiration must be after its issue time',
  });

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;

export type AppEnv = {
  Variables: JwtVariables<unknown> & {
    authenticatedUserId: string;
  };
};
