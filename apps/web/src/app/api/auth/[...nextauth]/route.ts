import { handlers } from "@/auth";

const { GET: origGET, POST: origPOST } = handlers;

async function withErrorLogging(fn: (req: Request) => Promise<Response>, req: Request): Promise<Response> {
  try {
    return await fn(req);
  } catch (e) {
    const err = e as Error;
    const detail = { url: req.url, name: err.name, message: err.message, stack: err.stack };
    console.error("[auth-route]", JSON.stringify(detail));
    return new Response(JSON.stringify(detail, null, 2), { status: 500, headers: { "content-type": "application/json" } });
  }
}

export const GET = (req: Request) => withErrorLogging(origGET, req);
export const POST = (req: Request) => withErrorLogging(origPOST, req);
