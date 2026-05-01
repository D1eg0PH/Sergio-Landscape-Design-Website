import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http'; // Importación crítica
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
// Al usar drizzle(sql), Next.js 16 ya no buscará el 'adapterFn' problemático
export const db = drizzle(sql, { schema });