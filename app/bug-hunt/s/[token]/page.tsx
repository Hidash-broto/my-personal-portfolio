import type { Metadata } from "next";
import { loadShareCard, shareCopy } from "@/features/bug-hunt/server";
import SharePoster from "@/features/bug-hunt/SharePoster";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { token } = await params;
    const { title, description } = shareCopy(await loadShareCard(token));
    return {
        title: { absolute: title },
        description,
        robots: { index: false, follow: true },
        openGraph: { title, description, type: "website", siteName: "Muhammed Hidash", url: `/bug-hunt/s/${token}` },
        twitter: { card: "summary_large_image", title, description },
    };
}

/** Shared score: verified on the server. A bad or tampered token still renders (generic card, HTTP 200). */
export default async function BugHuntSharePage({ params }: Props) {
    const { token } = await params;
    return <SharePoster card={await loadShareCard(token)} />;
}
