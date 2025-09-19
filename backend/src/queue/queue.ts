import { Queue } from "bullmq";
import Redis from "ioredis";
import { env } from "../env";

export const redis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
export const queue = new Queue("research", {
  connection: redis,
});
