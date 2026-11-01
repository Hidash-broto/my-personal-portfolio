"use client";

import { useId, type ReactNode } from "react";
import { Chevron, cx, SR_ONLY } from "./primitives";
import ui from "./ui.module.css";

/** iOS inset-grouped section: optional prominent header, rounded list, optional footer. */
export function GroupedSection({
    title,
    footer,
    children,
    card,
    label,
}: {
    title?: string;
    footer?: ReactNode;
    children: ReactNode;
    /** Render the body as a padded card instead of a list of rows. */
    card?: boolean;
    /** Accessible name when there is no visible title. */
    label?: string;
}) {
    const headingId = useId();
    return (
        <section className={ui.gSection} aria-labelledby={title ? headingId : undefined} aria-label={title ? undefined : label}>
            {title && (
                <h2 id={headingId} className={ui.gHeader}>
                    {title}
                </h2>
            )}
            {card ? <div className={ui.gCard}>{children}</div> : <ul className={ui.gList}>{children}</ul>}
            {footer && <p className={ui.gFooter}>{footer}</p>}
        </section>
    );
}

interface RowContent {
    title: ReactNode;
    subtitle?: ReactNode;
    /** Clamp the subtitle to two lines instead of one. */
    subtitleLines?: 1 | 2;
    detail?: ReactNode;
    leading?: ReactNode;
    strong?: boolean;
    /** Accessible name override (for rows whose visible text is long). */
    ariaLabel?: string;
}

function RowBody({ title, subtitle, subtitleLines = 1, detail, leading, strong, external }: RowContent & { external?: boolean }) {
    return (
        <>
            {leading}
            <span className={ui.gRowBody}>
                <span className={ui.gRowText}>
                    <span className={cx(ui.gRowTitle, strong && ui.gRowTitleStrong, ui.truncate)}>{title}</span>
                    {subtitle && (
                        <span className={cx(ui.gRowSubtitle, subtitleLines === 2 ? ui.clamp2 : ui.truncate)}>{subtitle}</span>
                    )}
                </span>
                {detail && <span className={ui.gRowDetail}>{detail}</span>}
                {external ? (
                    <svg className={ui.chevron} viewBox="0 0 12 12" aria-hidden="true" focusable="false" style={{ width: 11, height: 11 }}>
                        <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                ) : (
                    <Chevron />
                )}
            </span>
        </>
    );
}

/** A tappable row that pushes a detail page (calls `onPress`). */
export function GroupedButtonRow({ onPress, ...content }: RowContent & { onPress: () => void }) {
    return (
        <li>
            <button type="button" className={ui.gRow} onClick={onPress} aria-label={content.ariaLabel}>
                <RowBody {...content} />
            </button>
        </li>
    );
}

/** A row that navigates (link). External links open in a new tab. */
export function GroupedLinkRow({ href, ...content }: RowContent & { href: string }) {
    const external = /^https?:\/\//.test(href);
    return (
        <li>
            <a
                href={href}
                className={ui.gRow}
                aria-label={content.ariaLabel}
                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
                <RowBody {...content} external={external} />
                {external && <span style={SR_ONLY}> (opens in a new tab)</span>}
            </a>
        </li>
    );
}
