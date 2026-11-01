import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPost, formatDate, readingMinutes, type Block } from "@/data/posts";
import { LINKEDIN_URL, SITE_URL } from "@/data/links";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = getPost((await params).slug);
    if (!post) return {};
    const url = `/blog/${post.slug}`;
    return {
        title: post.title,
        description: post.description,
        keywords: post.tags,
        alternates: { canonical: url },
        openGraph: {
            title: post.title,
            description: post.description,
            url,
            type: "article",
            publishedTime: post.date,
            authors: ["Muhammed Hidash"],
            tags: post.tags,
        },
        twitter: { card: "summary", title: post.title, description: post.description },
    };
}

function renderBlock(block: Block, i: number) {
    switch (block.type) {
        case "h2":
            return <h2 key={i} className="mt-10 text-xl font-semibold text-white">{block.text}</h2>;
        case "ul":
            return (
                <ul key={i} className="mt-5 space-y-2.5 list-disc pl-5 marker:text-white/30">
                    {block.items.map((item) => <li key={item} className="leading-relaxed">{item}</li>)}
                </ul>
            );
        case "quote":
            return (
                <blockquote key={i} className="mt-6 border-l-2 border-sky-400/60 pl-4 text-white italic leading-relaxed">
                    {block.text}
                </blockquote>
            );
        default:
            return <p key={i} className="mt-5 leading-relaxed">{block.text}</p>;
    }
}

export default async function PostPage({ params }: Props) {
    const post = getPost((await params).slug);
    if (!post) notFound();

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        url: `${SITE_URL}/blog/${post.slug}`,
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        keywords: post.tags.join(", "),
        author: { "@type": "Person", name: "Muhammed Hidash", url: SITE_URL, sameAs: [LINKEDIN_URL] },
    };

    const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);

    return (
        <article>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors">← All notes</Link>

            <header className="mt-6">
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">{post.title}</h1>
                <p className="mt-4 text-sm text-white/45">
                    Muhammed Hidash · <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} min read
                </p>
            </header>

            <div className="mt-6 text-[17px] text-white/80">{post.body.map(renderBlock)}</div>

            <div className="mt-12 rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-white font-medium">This started as a LinkedIn post.</p>
                <p className="mt-1 text-sm text-white/60">
                    Join the conversation there, or{" "}
                    <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                        connect with me
                    </a>.
                </p>
                <a
                    href={post.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm font-medium text-sky-400 hover:text-sky-300"
                >
                    Discuss on LinkedIn →
                </a>
            </div>

            <nav className="mt-14" aria-label="More notes">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/40">More notes</h2>
                <ul className="mt-4 space-y-3">
                    {others.map((p) => (
                        <li key={p.slug}>
                            <Link href={`/blog/${p.slug}`} className="text-white/80 hover:text-sky-300 transition-colors">
                                {p.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </article>
    );
}
