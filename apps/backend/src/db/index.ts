import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from '../env.ts';
import * as schema from '@board-bot-arena/shared/src/schema.ts';

const sql = neon(config.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });