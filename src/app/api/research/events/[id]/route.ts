/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { NextRequest } from "next/server";

export const runtime = "nodejs"; // ensure Node runtime for streaming

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Send existing logs immediately
      const existing = await prisma.researchLog.findMany({
        where: { taskId: params.id },
        orderBy: { createdAt: "asc" },
      });
      for (const l of existing) {
        controller.enqueue(encoder.encode(`event: log\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(l)}\n\n`));
      }
      // Polling fallback (simple, works anywhere). You can switch to Redis pub/sub for push updates.
      let alive = true;
      async function poll() {
        let last = existing.at(-1)?.createdAt ?? new Date(0);
        while (alive) {
          const rows = await prisma.researchLog.findMany({
            where: { taskId: params.id, createdAt: { gt: last } },
            orderBy: { createdAt: "asc" },
          });
          for (const l of rows) {
            last = l.createdAt;
            controller.enqueue(encoder.encode(`event: log\n`));
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(l)}\n\n`)
            );
          }
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
      poll();

      // keep-alive
      const ka = setInterval(
        () => controller.enqueue(encoder.encode(`:\n\n`)),
        15000
      );
      // close
      (globalThis as any).addEventListener?.("close", () => {
        clearInterval(ka);
        alive = false;
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
