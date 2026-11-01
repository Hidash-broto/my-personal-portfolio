import { handleResult } from "@/features/bug-hunt/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** End a round: {nonce, score, activeMs, mask} → {token}, or 422 {reason} when malformed or implausible. */
export async function POST(request: Request): Promise<Response> {
    return handleResult(request);
}
