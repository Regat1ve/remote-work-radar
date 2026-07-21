import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

const { GET: origGET, POST: origPOST } = handlers;

async function withErrorLogging(fn: (req: NextRequest) => Promise<Response>, req: NextRequest): Promise<Response> {
  try {
    return await fn(req);
  } catch (e) {
    const err = e as Error;
    const detail = { url: req.url, name: err.name, message: err.message, stack: err.stack };
    console.error("[auth-route]", JSON.stringify(detail));
    return new Response(JSON.stringify(detail, null, 2), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export const GET = (req: NextRequest) => withErrorLogging(origGET, req);
export const POST = (req: NextRequest) => withErrorLogging(origPOST, req);
