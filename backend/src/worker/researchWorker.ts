import "dotenv/config";
import { Worker, JobsOptions } from "bullmq";
import Redis from "ioredis";
import { prisma } from "../db";
import { env } from "../env";
import { gatherArticles } from "../services/fetchers";
import { summarizeNaive, summarizeTextLLM } from "../services/summarize";
import { extractKeywords } from "../services/keywords";
import { logger } from "../logger";

type JobData = { taskId: string; topic: string };

const connection = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const pub = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });
const WORKER_NAME = "research-worker";
const DEFAULT_OPTS: JobsOptions = { removeOnComplete: true, attempts: 1 };

async function log(
  taskId: string,
  level: "INFO" | "WARN" | "ERROR",
  message: string,
  meta?: any
) {
  const entry = await prisma.logEntry.create({
    data: { taskId, level, message, meta },
  });
  await pub.publish(`logs:${taskId}`, JSON.stringify(entry));
}

const worker = new Worker<JobData>(
  "research",
  async (job) => {
    const { taskId, topic } = job.data;
    logger.info({ taskId, topic }, "Started task");

    await prisma.researchTask.update({
      where: { id: taskId },
      data: { status: "RUNNING" },
    });
    await log(taskId, "INFO", "Step 1 — Input parsed & stored");

    try {
      await log(taskId, "INFO", "Step 2 — Gathering articles from public APIs");
      const articles = await gatherArticles(topic);

      await log(
        taskId,
        "INFO",
        `Fetched ${articles.length} candidate articles`
      );

      // Summarize each (LLM if available; else naive)
      const withSummaries = [];
      for (const a of articles) {
        const base = a.summary ?? "";
        const summary =
          (await summarizeTextLLM(
            base || `${a.title}\n${a.url}\nSource: ${a.source}`,
            env.OPENAI_API_KEY
          )) || summarizeNaive(base || `${a.title} — ${a.source}`);

        withSummaries.push({ ...a, summary });
      }

      await log(
        taskId,
        "INFO",
        "Step 3 — Processing: summarization + keywords"
      );

      const corpus = withSummaries.map((a) => a.summary).join(" ");
      const keywords = extractKeywords(corpus, 15);

      await log(taskId, "INFO", `Extracted ${keywords.length} keywords`);

      // Persist result
      const result = await prisma.result.create({
        data: {
          taskId,
          keywords,
          articles: {
            create: withSummaries.map((a) => ({
              title: a.title,
              url: a.url,
              source: a.source,
              summary: a.summary,
              publishedAt: a.publishedAt ? new Date(a.publishedAt) : undefined,
              topic,
            })),
          },
        },
        include: { articles: true },
      });

      await log(taskId, "INFO", "Step 4 — Results saved", {
        articleCount: result.articles.length,
      });

      await prisma.researchTask.update({
        where: { id: taskId },
        data: { status: "SUCCEEDED" },
      });

      await log(taskId, "INFO", "Step 5 — Done: ready for frontend");
    } catch (err: any) {
      logger.error({ err }, "Worker error");
      await log(taskId, "ERROR", "Workflow failed", {
        error: err?.message ?? String(err),
      });
      await prisma.researchTask.update({
        where: { id: taskId },
        data: { status: "FAILED" },
      });
      throw err;
    }
  },
  { connection: connection as any, concurrency: 2 }
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, `${WORKER_NAME} completed`);
});
worker.on("failed", (job, err) => {
  logger.error({ jobId: job?.id, err }, `${WORKER_NAME} failed`);
});

logger.info(`${WORKER_NAME} is running`);
