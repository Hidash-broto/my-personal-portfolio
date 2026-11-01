"use client";

import { formatDate, posts, readingMinutes, type Post } from "@/data/posts";
import type { AppViewProps } from "../views";
import {
    AppRoot,
    Chips,
    cx,
    GroupedButtonRow,
    GroupedSection,
    LinkButton,
    PhoneStack,
    ReaderBlocks,
    Sidebar,
    TextLink,
    ui,
} from "../_ui";
import s from "./notes.module.css";

/** Newest first. */
const NOTES: readonly Post[] = [...posts].sort((a, b) => b.date.localeCompare(a.date));

const BY_YEAR = NOTES.reduce<{ id: string; title: string; items: Post[] }[]>((groups, post) => {
    const year = post.date.slice(0, 4);
    const group = groups.find((g) => g.id === year);
    if (group) group.items.push(post);
    else groups.push({ id: year, title: year, items: [post] });
    return groups;
}, []);

const shortDate = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

const findNote = (slug: string | null) => (slug ? NOTES.find((p) => p.slug === slug) : undefined);

const webPage = (post: Post) => `/blog/${post.slug}`;

function Byline({ post }: { post: Post }) {
    const minutes = readingMinutes(post);
    return (
        <p className={s.eyebrow}>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span aria-hidden="true"> · </span>
            {minutes} min read
        </p>
    );
}

/* ---------- desktop: list column + reader ---------- */

function DesktopReader({ post }: { post: Post }) {
    return (
        <article className={s.article} aria-labelledby={`note-${post.slug}`}>
            <header>
                <Byline post={post} />
                <h1 id={`note-${post.slug}`} className={s.title}>
                    {post.title}
                </h1>
                <p className={s.dek}>{post.description}</p>
                <div className={s.toolbar}>
                    <TextLink href={webPage(post)}>Open as web page</TextLink>
                    <div className={s.tags}>
                        <Chips items={post.tags} label="Tags" />
                    </div>
                </div>
            </header>
            <hr className={s.divider} />
            <ReaderBlocks blocks={post.body} />
            <footer className={s.footer}>
                <p className={s.footerText}>Continue the conversation</p>
                <div className={s.footerActions}>
                    <LinkButton href={webPage(post)} variant="secondary">
                        Open as web page
                    </LinkButton>
                    <LinkButton href={post.linkedinUrl}>Discuss on LinkedIn</LinkButton>
                </div>
            </footer>
        </article>
    );
}

function DesktopNotes({ item, openItem }: Pick<AppViewProps, "item" | "openItem">) {
    const post = findNote(item) ?? NOTES[0];
    return (
        <div className={ui.split}>
            <Sidebar
                label="Notes"
                variant="list"
                sections={BY_YEAR}
                selectedId={post.slug}
                getId={(p) => p.slug}
                getLabel={(p) => `${p.title}, ${formatDate(p.date)}`}
                onSelect={openItem}
                width={290}
                renderItem={(p) => (
                    <span className={s.noteRow}>
                        <span className={cx(s.noteTitle, ui.clamp2)}>{p.title}</span>
                        <span className={s.noteMeta}>
                            <time className={s.noteDate} dateTime={p.date}>
                                {shortDate(p.date)}
                            </time>
                        </span>
                        <span className={cx(s.noteDesc, ui.clamp2)}>{p.description}</span>
                    </span>
                )}
            />
            <div key={post.slug} className={cx(ui.detail, ui.scroll)}>
                <DesktopReader post={post} />
            </div>
        </div>
    );
}

/* ---------- phone: grouped list → reader ---------- */

function PhoneReader({ post }: { post: Post }) {
    return (
        <article className={s.phoneArticle} aria-labelledby={`note-${post.slug}`}>
            <header>
                <Byline post={post} />
                <h1 id={`note-${post.slug}`} className={s.title}>
                    {post.title}
                </h1>
                <p className={s.dek}>{post.description}</p>
            </header>
            <hr className={s.divider} />
            <ReaderBlocks blocks={post.body} />
            <footer className={s.phoneFooter}>
                <LinkButton href={post.linkedinUrl} block>
                    Discuss on LinkedIn
                </LinkButton>
                <LinkButton href={webPage(post)} variant="secondary" block>
                    Open as web page
                </LinkButton>
            </footer>
        </article>
    );
}

function PhoneNotes({ item, openItem }: Pick<AppViewProps, "item" | "openItem">) {
    const post = findNote(item);
    return (
        <PhoneStack
            detailKey={post?.slug ?? null}
            detail={post && <PhoneReader post={post} />}
            list={BY_YEAR.map((group) => (
                <GroupedSection key={group.id} title={group.title}>
                    {group.items.map((p) => (
                        <GroupedButtonRow
                            key={p.slug}
                            onPress={() => openItem(p.slug)}
                            title={p.title}
                            strong
                            subtitleLines={2}
                            subtitle={
                                <>
                                    <time className={s.phoneRowDate} dateTime={p.date}>
                                        {shortDate(p.date)}
                                    </time>
                                    {p.description}
                                </>
                            }
                        />
                    ))}
                </GroupedSection>
            ))}
        />
    );
}

export default function NotesView({ shell, item, openItem }: AppViewProps) {
    return (
        <AppRoot shell={shell} label="notes">
            {shell === "phone" ? <PhoneNotes item={item} openItem={openItem} /> : <DesktopNotes item={item} openItem={openItem} />}
        </AppRoot>
    );
}
