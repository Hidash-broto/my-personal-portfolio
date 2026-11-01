import Link from "next/link";
import OsRoot from "@/components/os/OsRoot";
import { posts } from "@/data/posts";
import { LINKEDIN_URL, GITHUB_URL, INSTAGRAM_URL, SITE_URL } from "@/data/links";

const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Muhammed Hidash",
    url: SITE_URL,
    image: `${SITE_URL}/my-photo.png`,
    jobTitle: "Chief Technology Officer",
    worksFor: { "@type": "Organization", name: "Dentobees" },
    description: "Startup builder. Tech by craft, business by curiosity. Engineer at heart, product builder by choice.",
    knowsAbout: ["Software engineering", "Systems architecture", "SaaS", "Product engineering", "Applied AI", "Startups"],
    sameAs: [LINKEDIN_URL, GITHUB_URL, INSTAGRAM_URL],
};

export default function Home() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />

            {/* Server-rendered summary: the desktop UI below is client-only, so this is what search engines and screen readers read. */}
            <section className="sr-only">
                <h1>Muhammed Hidash — Startup builder. Tech by craft, business by curiosity.</h1>
                <p>Engineer at heart, product builder by choice. CTO at Dentobees, an early-stage SaaS startup.</p>
                <h2>Builds</h2>
                <ul>
                    <li><a href="https://salestrack.in">WhatsApp AI Sales CRM</a></li>
                    <li>Multi-product SaaS suite with single sign-on</li>
                    <li>Software Factory</li>
                    <li><a href="https://github.com/Hidash-broto/agent_view">agentview (open source)</a></li>
                </ul>
                <h2>Notes</h2>
                <ul>
                    {posts.map((post) => (
                        <li key={post.slug}><Link href={`/blog/${post.slug}`}>{post.title}</Link></li>
                    ))}
                </ul>
                <p><a href={LINKEDIN_URL}>Say hi on LinkedIn</a></p>
            </section>

            <OsRoot />
        </>
    );
}
