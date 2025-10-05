/* eslint-disable @typescript-eslint/no-explicit-any */
import { Queue, Worker, QueueEvents, JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { runtime } from "@/lib/config/runtime";
import { prisma } from "@/lib/db";
import { runWorkflow } from "./workflow";

export const connection = new IORedis(runtime.redisUrl);

export const researchQueue = new Queue("research", { connection });
export const researchEvents = new QueueEvents("research", { connection });

export type ResearchJobData = { taskId: string };

export async function enqueueResearch(taskId: string) {
  const opts: JobsOptions = { removeOnComplete: 100, removeOnFail: 100 };
  await researchQueue.add("run", { taskId }, opts);
}

// Worker is started by a separate process (see worker/index.ts). Do not start it in API runtime on Vercel.
export function startWorker() {
  const worker = new Worker<ResearchJobData>(
    "research",
    async (job) => {
      const { taskId } = job.data;
      await prisma.researchTask.update({
        where: { id: taskId },
        data: { status: "RUNNING" },
      });
      try {
        await runWorkflow(taskId);
        await prisma.researchTask.update({
          where: { id: taskId },
          data: { status: "COMPLETED" },
        });
      } catch (err: any) {
        await prisma.researchTask.update({
          where: { id: taskId },
          data: { status: "FAILED" },
        });
        await prisma.researchLog.create({
          data: {
            taskId,
            step: 0,
            label: "error",
            message: err?.message ?? "Unknown error",
            payload: { stack: err?.stack },
          },
        });
        throw err;
      }
    },
    { connection }
  );

  return worker;
}
