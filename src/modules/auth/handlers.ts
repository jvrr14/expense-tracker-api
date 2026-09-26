import { loginService, REGISTER_SUCCESS_MESSAGE, registerService } from "./services.js";
import { createFactory } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "./schema.js";
import type { AppEnv } from "../../shared/auth.js";

const factory = createFactory<AppEnv>();

export const registerHandlers = factory.createHandlers(
    zValidator('json', registerSchema),
    async (c) => {
        const { name, email, password } = c.req.valid('json');
        await registerService(name, email, password);
        return c.json({ success: true, message: REGISTER_SUCCESS_MESSAGE }, 201);
    }
);

export const loginHandlers = factory.createHandlers(
    zValidator('json', loginSchema),
    async (c) => {
        const { email, password } = c.req.valid('json');
        const result = await loginService(email, password);
        return c.json({ success: true, data: result }, 200);
    }
);
