/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enqueueResearch } from "@/lib/queue";
import { runtime } from "@/lib/config/runtime";

function ok(data: any, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}
function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin") ?? "";
  if (
    runtime.allowedOrigins.length &&
    !runtime.allowedOrigins.includes(origin)
  ) {
    return bad("Origin not allowed", 403);
  }
  const body = await req.json().catch(() => null);
  const topic = (body?.topic ?? "").trim();
  if (!topic) return bad("topic is required");

  // Step 1 — Input parsing & store request
  const task = await prisma.researchTask.create({
    data: { topic, status: "PENDING" },
  });
  await prisma.researchLog.create({
    data: {
      taskId: task.id,
      step: 1,
      label: "input",
      message: "Task created",
      payload: { topic },
    },
  });

  // enqueue background job
  await enqueueResearch(task.id);

  return ok({ id: task.id });
}

export async function GET() {
  const tasks = await prisma.researchTask.findMany({
    orderBy: { createdAt: "desc" },
  });
  return ok({ tasks });
}
