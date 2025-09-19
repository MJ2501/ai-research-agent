import "dotenv/config";
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { env } from "./env";
import researchRoutes from "./routes/research";
import { sseLogsHandler } from "./sse";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN ?? "*",
    credentials: false,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(pinoHttp());

app.get("/healthz", (_req, res) => res.json({ ok: true }));
app.use("/research", researchRoutes);

// SSE live logs
app.get("/research/:id/events", sseLogsHandler);

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  const status = err?.status ?? 400;
  res.status(status).json({
    error: err?.message ?? "Bad Request",
    issues: err?.issues ?? undefined,
  });
});

app.listen(env.PORT, () => {
  console.log(`API on :${env.PORT}`);
});
