import { handleStart } from "@/features/bug-hunt/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Start a round: a signed start nonce, or 503 {reason:"not-configured"} without SHARE_SECRET. */
export async function POST(): Promise<Response> {
    return handleStart();
}
