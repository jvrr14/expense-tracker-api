import { sign } from "hono/jwt";
import { env } from "../../config/env.js";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  JWT_ALGORITHM,
  type AccessTokenPayload,
} from "../../shared/auth.js";
import { ConflictError, UnauthorizedError } from "../../shared/errors.js";
import { createUser, getUserByEmail } from "./repository.js";
import argon2 from "argon2";

const HASH_OPTIONS: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
};

export const REGISTER_SUCCESS_MESSAGE =
    'Account created successfully.';

export const registerService = async (name: string, email: string, password: string) => {
    const hashedPassword = await argon2.hash(password, HASH_OPTIONS);

    const user = await createUser(name, email, hashedPassword);

    if (!user) {
        throw new ConflictError('An account with this email already exists');
    }
};

const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

export const loginService = async (email: string, password: string) => {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  const passwordMatches = await argon2.verify(user.passwordHash, password);

  if (!passwordMatches) {
    throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const payload: AccessTokenPayload = {
    sub: user.id,
    iat: issuedAt,
    exp: issuedAt + ACCESS_TOKEN_TTL_SECONDS,
  };

  const accessToken = await sign(
    payload,
    env.JWT_SECRET,
    JWT_ALGORITHM,
  );

  return {
    accessToken,
    expiresIn: ACCESS_TOKEN_TTL_SECONDS,
  };
};
