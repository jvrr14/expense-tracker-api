import { Hono } from "hono";
import { loginHandlers, registerHandlers } from "./handlers.js";
import type { AppEnv } from "../../shared/auth.js";

const authRoutes = new Hono<AppEnv>();

authRoutes.post('/register', ...registerHandlers);
authRoutes.post('/login', ...loginHandlers);

export { authRoutes };
