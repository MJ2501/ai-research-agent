"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sseLogsHandler = sseLogsHandler;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
function sseLogsHandler(req, res) {
    const { id } = req.params;
    if (!id)
        return res.status(400).end();
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    // Ping to keep connection alive
    const ping = setInterval(() => {
        res.write(": ping\n\n");
    }, 15000);
    const sub = new ioredis_1.default(env_1.env.REDIS_URL, { lazyConnect: true });
    sub.on("error", () => {
        // Best-effort; if Redis down, end SSE so client can retry
        clearInterval(ping);
        res.end();
    });
    sub.subscribe(`logs:${id}`).then(() => {
        // Send an initial event so UI can render instantly
        res.write(`event: init\ndata: ${JSON.stringify({ ok: true })}\n\n`);
    });
    sub.on("message", (_channel, payload) => {
        res.write(`data: ${payload}\n\n`);
    });
    req.on("close", () => {
        clearInterval(ping);
        sub.quit();
    });
}
