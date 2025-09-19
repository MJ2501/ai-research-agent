"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const pino_http_1 = __importDefault(require("pino-http"));
const env_1 = require("./env");
const research_1 = __importDefault(require("./routes/research"));
const sse_1 = require("./sse");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN ?? "*",
    credentials: false,
}));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, pino_http_1.default)());
app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/research", research_1.default);
// SSE live logs
app.get("/research/:id/events", sse_1.sseLogsHandler);
// Error handler
app.use((err, _req, res, _next) => {
    const status = err?.status ?? 400;
    res.status(status).json({
        error: err?.message ?? "Bad Request",
        issues: err?.issues ?? undefined,
    });
});
app.listen(env_1.env.PORT, () => {
    console.log(`API on :${env_1.env.PORT}`);
});
