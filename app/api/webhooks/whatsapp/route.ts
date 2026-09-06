import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { configuredValue, hasConfiguredValues } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_WEBHOOK_BYTES = 64 * 1024;

async function readBoundedBody(request: NextRequest) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_WEBHOOK_BYTES) {
      await reader.cancel();
      throw new RangeError("Webhook payload is too large.");
    }
    chunks.push(value);
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

export async function GET(request: NextRequest) {
  if (!hasConfiguredValues("WHATSAPP_WEBHOOK_VERIFY_TOKEN")) return new NextResponse("Webhook not configured", { status: 503 });
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === configuredValue("WHATSAPP_WEBHOOK_VERIFY_TOKEN")) return new NextResponse(challenge, { status: 200 });
  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  if (!hasConfiguredValues("WHATSAPP_APP_SECRET", "DATABASE_URL")) return NextResponse.json({ success: false }, { status: 503 });
  const supplied = request.headers.get("x-hub-signature-256")?.replace(/^sha256=/, "");
  if (!supplied || !/^[a-f0-9]{64}$/i.test(supplied)) return NextResponse.json({ success: false }, { status: 401 });

  let body: string;
  try {
    body = await readBoundedBody(request);
  } catch {
    return NextResponse.json({ success: false }, { status: 413 });
  }

  const expected = createHmac("sha256", configuredValue("WHATSAPP_APP_SECRET")).update(body).digest();
  const valid = timingSafeEqual(Buffer.from(supplied, "hex"), expected);
  if (!valid) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const payload = JSON.parse(body) as Record<string, Prisma.InputJsonValue>;
    const payloadHash = createHash("sha256").update(body).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60_000);
    await prisma.whatsAppWebhookEvent.create({
      data: {
        payloadHash,
        eventType: typeof payload.object === "string" ? payload.object : "whatsapp-event",
        payload,
        expiresAt,
      },
    });
    console.info(JSON.stringify({ level: "info", event: "whatsapp_webhook_persisted", payloadHash: payloadHash.slice(0, 12) }));
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ success: true, duplicate: true });
    if (error instanceof SyntaxError) return NextResponse.json({ success: false }, { status: 400 });
    console.error(JSON.stringify({ level: "error", event: "whatsapp_webhook_persistence_failed", error: error instanceof Error ? error.name : "UnknownError" }));
    return NextResponse.json({ success: false }, { status: 503 });
  }
}
