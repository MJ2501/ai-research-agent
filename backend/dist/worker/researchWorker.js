"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const db_1 = require("../db");
const env_1 = require("../env");
const fetchers_1 = require("../services/fetchers");
const summarize_1 = require("../services/summarize");
const keywords_1 = require("../services/keywords");
const logger_1 = require("../logger");
const connection = new ioredis_1.default(env_1.env.REDIS_URL, { maxRetriesPerRequest: null });
const pub = new ioredis_1.default(env_1.env.REDIS_URL, { maxRetriesPerRequest: null });
const WORKER_NAME = "research-worker";
const DEFAULT_OPTS = { removeOnComplete: true, attempts: 1 };
async function log(taskId, level, message, meta) {
    const entry = await db_1.prisma.logEntry.create({
        data: { taskId, level, message, meta },
    });
    await pub.publish(`logs:${taskId}`, JSON.stringify(entry));
}
const worker = new bullmq_1.Worker("research", async (job) => {
    const { taskId, topic } = job.data;
    logger_1.logger.info({ taskId, topic }, "Started task");
    await db_1.prisma.researchTask.update({
        where: { id: taskId },
        data: { status: "RUNNING" },
    });
    await log(taskId, "INFO", "Step 1 — Input parsed & stored");
    try {
        await log(taskId, "INFO", "Step 2 — Gathering articles from public APIs");
        const articles = await (0, fetchers_1.gatherArticles)(topic);
        await log(taskId, "INFO", `Fetched ${articles.length} candidate articles`);
        // Summarize each (LLM if available; else naive)
        const withSummaries = [];
        for (const a of articles) {
            const base = a.summary ?? "";
            const summary = (await (0, summarize_1.summarizeTextLLM)(base || `${a.title}\n${a.url}\nSource: ${a.source}`, env_1.env.OPENAI_API_KEY)) || (0, summarize_1.summarizeNaive)(base || `${a.title} — ${a.source}`);
            withSummaries.push({ ...a, summary });
        }
        await log(taskId, "INFO", "Step 3 — Processing: summarization + keywords");
        const corpus = withSummaries.map((a) => a.summary).join(" ");
        const keywords = (0, keywords_1.extractKeywords)(corpus, 15);
        await log(taskId, "INFO", `Extracted ${keywords.length} keywords`);
        // Persist result
        const result = await db_1.prisma.result.create({
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
        await db_1.prisma.researchTask.update({
            where: { id: taskId },
            data: { status: "SUCCEEDED" },
        });
        await log(taskId, "INFO", "Step 5 — Done: ready for frontend");
    }
    catch (err) {
        logger_1.logger.error({ err }, "Worker error");
        await log(taskId, "ERROR", "Workflow failed", {
            error: err?.message ?? String(err),
        });
        await db_1.prisma.researchTask.update({
            where: { id: taskId },
            data: { status: "FAILED" },
        });
        throw err;
    }
}, { connection: connection, concurrency: 2 });
worker.on("completed", (job) => {
    logger_1.logger.info({ jobId: job.id }, `${WORKER_NAME} completed`);
});
worker.on("failed", (job, err) => {
    logger_1.logger.error({ jobId: job?.id, err }, `${WORKER_NAME} failed`);
});
logger_1.logger.info(`${WORKER_NAME} is running`);
