"use client";

import { ArrowUpRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { ShellKind } from "@/lib/os";
import ui from "./ui.module.css";
import HeadAvatar from "@/components/brand/HeadAvatar";

export function cx(...names: (string | false | null | undefined)[]): string {
    return names.filter(Boolean).join(" ");
}

/** The content root of every app view: fills the window/sheet, scrolls internally, adapts type to the shell. */
export function AppRoot({
    shell,
    label,
    children,
    className,
    style,
}: {
    shell: ShellKind;
    label: string;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}) {
    return (
        <div
            className={cx(ui.root, shell === "phone" ? ui.phone : ui.desktop, className)}
            data-app-view={label}
            style={style}
        >
            {children}
        </div>
    );
}

/** Stack technologies: quiet rounded labels (8px radius), not pills. */
export function Chips({ items, label }: { items: readonly string[]; label: string }) {
    if (items.length === 0) return null;
    return (
        <ul className={ui.chips} aria-label={label}>
            {items.map((item) => (
                <li key={item} className={ui.chip}>
                    {item}
                </li>
            ))}
        </ul>
    );
}

export function Bullets({ items }: { items: readonly string[] }) {
    return (
        <ul className={ui.bullets}>
            {items.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    );
}

/** A titled block of content. Renders nothing when it has nothing to show. */
export function Section({ title, children, show = true }: { title: string; children: ReactNode; show?: boolean }) {
    if (!show) return null;
    return (
        <section className={ui.section}>
            <h3 className={ui.sectionTitle}>{title}</h3>
            {children}
        </section>
    );
}

const isExternal = (href: string) => /^(https?:)?\/\//.test(href) || href.startsWith("mailto:");

/** A link styled as a button. External links open in a new tab and say so. */
export function LinkButton({
    href,
    children,
    variant = "primary",
    block,
    icon,
}: {
    href: string;
    children: ReactNode;
    variant?: "primary" | "secondary";
    block?: boolean;
    icon?: ReactNode;
}) {
    const external = isExternal(href) && !href.startsWith("mailto:");
    return (
        <a
            href={href}
            className={cx(ui.btn, variant === "primary" ? ui.btnPrimary : ui.btnSecondary, block && ui.btnBlock)}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            {icon}
            <span>{children}</span>
            {external && <ArrowUpRight className={ui.btnIcon} aria-hidden="true" strokeWidth={2.4} />}
            {external && <span style={SR_ONLY}> (opens in a new tab)</span>}
        </a>
    );
}

export const SR_ONLY: CSSProperties = {
    position: "absolute",
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    whiteSpace: "nowrap",
    border: 0,
};

/** An inline text link with an arrow. */
export function TextLink({ href, children }: { href: string; children: ReactNode }) {
    const external = isExternal(href) && !href.startsWith("mailto:");
    return (
        <a href={href} className={cx(ui.link, ui.linkRow)} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
            {children}
            <span aria-hidden="true">{external ? " ↗" : " →"}</span>
            {external && <span style={SR_ONLY}> (opens in a new tab)</span>}
        </a>
    );
}

/** Profile avatar: mini-Hidash's head in a lit blue disc. `initials` stays for screen-reader-free fallbacks. */
export function Avatar({ initials, size, label }: { initials: string; size: number; label?: string }) {
    return (
        <span
            className={ui.avatar}
            style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
            role={label ? "img" : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            data-initials={initials}
        >
            <HeadAvatar />
        </span>
    );
}

/** App Store-style strip of short facts. */
export function InfoStrip({ cells }: { cells: { label: string; value: string }[] }) {
    if (cells.length === 0) return null;
    return (
        <dl className={ui.infoStrip}>
            {cells.map((c) => (
                <div key={c.label} className={ui.infoCell}>
                    <dt className={ui.infoLabel}>{c.label}</dt>
                    <dd className={ui.infoValue}>{c.value}</dd>
                </div>
            ))}
        </dl>
    );
}

export function Chevron() {
    return (
        <svg className={ui.chevron} viewBox="0 0 8 14" aria-hidden="true" focusable="false">
            <path d="M1.5 1.5 6.5 7l-5 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

/** Find a record by id, or undefined. */
export function findById<T extends { id: string }>(list: readonly T[], id: string | null): T | undefined {
    return id ? list.find((x) => x.id === id) : undefined;
}
