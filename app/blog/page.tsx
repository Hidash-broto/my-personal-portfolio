import type { Metadata } from "next";
import Link from "next/link";
import { posts, formatDate, readingMinutes } from "@/data/posts";

const description =
    "Notes by Muhammed Hidash on building startups and software: engineering judgment, technical debt, applied AI, and staying close to the customer.";

export const metadata: Metadata = {
    title: "Notes on Building Startups and Software",
    description,
    alternates: { canonical: "/blog" },
    openGraph: {
        title: "Notes on Building Startups and Software — Muhammed Hidash",
        description,
        url: "/blog",
        type: "website",
    },
};

export default function BlogIndex() {
    return (
        <>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Notes</h1>
            <p className="mt-3 text-white/60 leading-relaxed">
                On building startups and software: engineering judgment, technical debt, applied AI,
                and staying close to the customer.
            </p>

            <ul className="mt-12 space-y-10">
                {posts.map((post) => (
                    <li key={post.slug}>
                        <article>
                            <p className="text-xs text-white/40">
                                <time dateTime={post.date}>{formatDate(post.date)}</time> · {readingMinutes(post)} min read
                            </p>
                            <h2 className="mt-1.5 text-xl font-semibold text-white">
                                <Link href={`/blog/${post.slug}`} className="hover:text-sky-300 transition-colors">
                                    {post.title}
                                </Link>
                            </h2>
                            <p className="mt-2 text-white/60 leading-relaxed">{post.description}</p>
                        </article>
                    </li>
                ))}
            </ul>
        </>
    );
}
