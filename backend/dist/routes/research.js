"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const db_1 = require("../db");
const queue_1 = require("../queue/queue");
const router = (0, express_1.Router)();
const SubmitSchema = zod_1.z.object({
    topic: zod_1.z.string().min(3).max(200),
});
// POST /research → submit new topic, enqueue
router.post("/", async (req, res, next) => {
    try {
        const { topic } = SubmitSchema.parse(req.body);
        const task = await db_1.prisma.researchTask.create({
            data: { topic, status: "PENDING" },
        });
        // Enqueue background job (jobId == taskId)
        await queue_1.queue.add("run", { taskId: task.id, topic }, { jobId: task.id, attempts: 1, removeOnComplete: true });
        res
            .status(201)
            .json({
            id: task.id,
            topic: task.topic,
            status: task.status,
            createdAt: task.createdAt,
        });
    }
    catch (err) {
        next(err);
    }
});
// GET /research → list all tasks (newest first)
router.get("/", async (_req, res, next) => {
    try {
        const tasks = await db_1.prisma.researchTask.findMany({
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                topic: true,
                status: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        res.json(tasks);
    }
    catch (err) {
        next(err);
    }
});
// GET /research/:id → full detail: logs + result
router.get("/:id", async (req, res, next) => {
    try {
        const task = await db_1.prisma.researchTask.findUnique({
            where: { id: req.params.id },
            include: {
                logs: { orderBy: { ts: "asc" } },
                result: { include: { articles: { orderBy: { createdAt: "asc" } } } },
            },
        });
        if (!task)
            return res.status(404).json({ error: "Not found" });
        res.json(task);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
