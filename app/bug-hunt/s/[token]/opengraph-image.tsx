import { bugHuntImage } from "@/features/bug-hunt/og";
import { loadShareCard } from "@/features/bug-hunt/server";

export const alt = "A Bug Hunt score on Hidash OS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const card = await loadShareCard(token);
    return bugHuntImage(card.valid ? card.score : null);
}
