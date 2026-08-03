import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { config } from '../env.ts';
import * as schema from '@board-bot-arena/shared/src/schema.ts';

const pool = new Pool({ connectionString: config.DATABASE_URL! });
export const db = drizzle({ client: pool, schema });