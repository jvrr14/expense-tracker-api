import { createUser } from "./repository.js";
import argon2 from "argon2";

const HASH_OPTIONS: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
};

const isUniqueViolation = (error: unknown): error is { code: string } => {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === '23505';
};

export const REGISTER_SUCCESS_MESSAGE =
    'If this email is not already registered, your account has been created.';

export const registerService = async (name: string, email: string, password: string) => {
    const hashedPassword = await argon2.hash(password, HASH_OPTIONS);

    try {
        await createUser(name, email, hashedPassword);
    } catch (error) {
        if (isUniqueViolation(error)) {
            return;
        }

        throw error;
    }
};