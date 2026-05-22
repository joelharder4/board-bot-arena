import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.url("Database URL must be valid"),
  JWT_SECRET: z.string().min(10, "JWT Secret must be at least 10 characters long"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables:");
  console.error(z.flattenError(parsedEnv.error).fieldErrors);
  process.exit(1);
}

export const config = parsedEnv.data;