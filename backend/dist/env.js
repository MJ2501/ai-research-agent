"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    DATABASE_URL: zod_1.z.string(),
    REDIS_URL: zod_1.z.string(),
    PORT: zod_1.z.coerce.number().default(8080),
    CORS_ORIGIN: zod_1.z.string().optional(),
    OPENAI_API_KEY: zod_1.z.string().optional(),
});
exports.env = EnvSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL,
    PORT: process.env.PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
});
