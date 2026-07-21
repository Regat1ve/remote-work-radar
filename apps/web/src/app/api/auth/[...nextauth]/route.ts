import { handlers } from "@/auth";
import type { NextRequest } from "next/server";
import { logError } from "@/lib/error-log";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const { GET: origGET, POST: origPOST } = handlers;

async function withErrorLogging(fn: (req: NextRequest) => Promise<Response>, req: NextRequest): Promise<Response> {
  await logError("route-in", { url: req.url, method: req.method });
  try {
    const res = await fn(req);
    if (req.url.includes("/callback/")) {
      await logError("route-out", { url: req.url, status: res.status, location: res.headers.get("location") });
    }
    return res;
  } catch (e) {
    const err = e as Error;
    const detail = { url: req.url, name: err.name, message: err.message, stack: err.stack };
    await logError("route-throw", detail);
    return new Response(JSON.stringify(detail, null, 2), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export const GET = (req: NextRequest) => withErrorLogging(origGET, req);
export const POST = (req: NextRequest) => withErrorLogging(origPOST, req);
