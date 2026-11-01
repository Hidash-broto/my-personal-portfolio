import type { MetadataRoute } from "next";
import { posts } from "@/data/posts";
import { SITE_URL } from "@/data/links";

export default function sitemap(): MetadataRoute.Sitemap {
    const latest = posts.reduce((max, p) => (p.date > max ? p.date : max), posts[0].date);
    return [
        { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
        { url: `${SITE_URL}/blog`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
        ...posts.map((post) => ({
            url: `${SITE_URL}/blog/${post.slug}`,
            lastModified: post.date,
            changeFrequency: "yearly" as const,
            priority: 0.7,
        })),
    ];
}
