import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import type { CurrentUser } from './types.js';

export async function getUserById(
  userId: string,
): Promise<CurrentUser | undefined> {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}
