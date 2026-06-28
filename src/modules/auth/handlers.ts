import { REGISTER_SUCCESS_MESSAGE, registerService } from "./services.js";
import { createFactory } from "hono/factory";
import { zValidator } from "@hono/zod-validator";
import { registerSchema } from "./schema.js";

const factory = createFactory();

export const registerHandlers = factory.createHandlers(
    zValidator('json', registerSchema),
    async (c) => {
        const { name, email, password } = c.req.valid('json');
        await registerService(name, email, password);
        return c.json({ success: true, message: REGISTER_SUCCESS_MESSAGE }, 201);
    }
);

