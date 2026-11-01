"use client";

import type { ReactNode } from "react";
import { PROFILE } from "@/data/profile";
import type { ShellKind } from "@/lib/os";
import { Avatar, Chevron, SR_ONLY } from "./primitives";
import p from "./profile.module.css";

export const profileStyles = p;

export const INITIALS = PROFILE.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/** Centered contact-card header: avatar, name, role, and optionally the brand lines. */
export function ProfileHeader({ shell, withHeadline = false }: { shell: ShellKind; withHeadline?: boolean }) {
    return (
        <header className={p.profile}>
            <Avatar initials={INITIALS} size={shell === "phone" ? 104 : 88} />
            <h1 className={p.name}>{PROFILE.name}</h1>
            <p className={p.role}>{PROFILE.role}</p>
            {withHeadline && (
                <>
                    <p className={p.headline}>{PROFILE.headline}</p>
                    <p className={p.subline}>{PROFILE.subline}</p>
                </>
            )}
        </header>
    );
}

export interface LinkRowSpec {
    href: string;
    title: string;
    subtitle?: string;
    leading?: ReactNode;
}

/** macOS grouped link list (System Settings style). External links open in a new tab. */
export function DesktopLinkList({ rows, label }: { rows: LinkRowSpec[]; label: string }) {
    return (
        <ul className={p.mList} aria-label={label}>
            {rows.map((row) => {
                const external = /^https?:\/\//.test(row.href);
                return (
                    <li key={row.href}>
                        <a className={p.mRow} href={row.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                            {row.leading}
                            <span className={p.mText}>
                                <span className={p.mTitle}>{row.title}</span>
                                {row.subtitle && <span className={p.mSubtitle}>{row.subtitle}</span>}
                            </span>
                            <span className={p.mTrail} aria-hidden="true">
                                {external ? (
                                    <svg width="11" height="11" viewBox="0 0 12 12" focusable="false">
                                        <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <Chevron />
                                )}
                            </span>
                            {external && <span style={SR_ONLY}> (opens in a new tab)</span>}
                        </a>
                    </li>
                );
            })}
        </ul>
    );
}
