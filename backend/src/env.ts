import { z } from "zod";

const EnvSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  PORT: z.coerce.number().default(8080),
  CORS_ORIGIN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
});

export const env = EnvSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  PORT: process.env.PORT,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});
