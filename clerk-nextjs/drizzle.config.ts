import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Esto carga el archivo .env.local de la raíz
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Usamos el nombre exacto de la variable en tu .env.local
    url: process.env.DATABASE_URL!, 
  },
});