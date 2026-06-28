import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server listening on http://localhost:${info.port}`);
  },
);
