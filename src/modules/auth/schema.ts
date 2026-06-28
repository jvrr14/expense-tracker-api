import z from "zod";

const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ message: 'Invalid email address' }));

export const registerSchema = z.object({
    name: z.string().min(1, { message: 'Name is required' }),
    email: emailSchema,
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});