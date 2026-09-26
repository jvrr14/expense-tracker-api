import type { User } from '../../db/schema.js';

export type CurrentUser = Pick<
  User,
  'id' | 'name' | 'email' | 'createdAt' | 'updatedAt'
>;
