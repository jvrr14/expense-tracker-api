import type { Context } from 'hono';

export function ok<T>(c: Context, data: T, statusCode: 200 | 201 = 200) {
  return c.json({ success: true, data }, statusCode);
}

export function noContent(c: Context) {
  return c.body(null, 204);
}

export function created<T>(c: Context, data: T) {
  return ok(c, data, 201);
}
