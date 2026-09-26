import { UnauthorizedError } from '../../shared/errors.js';
import { getUserById } from './repository.js';
import type { CurrentUser } from './types.js';

export async function getCurrentUserService(
  userId: string,
): Promise<CurrentUser> {
  const user = await getUserById(userId);
  if (!user) throw new UnauthorizedError('User not found')

  return user;
}
