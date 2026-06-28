import { Hono } from "hono";
import { registerHandlers } from "./handlers.js";

const authRoutes = new Hono();

authRoutes.post('/register', ...registerHandlers);


export { authRoutes };