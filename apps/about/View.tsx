"use client";

import { LINKEDIN_URL } from "@/data/links";
import { PROFILE } from "@/data/profile";
import { AppIcon } from "../icons";
import type { IconKey } from "../registry";
import type { AppViewProps } from "../views";
import {
    AppRoot,
    cx,
    DesktopLinkList,
    GroupedLinkRow,
    GroupedSection,
    ProfileHeader,
    profileStyles,
    Section,
    ui,
} from "../_ui";

const ELSEWHERE: { href: string; title: string; subtitle: string; icon: IconKey }[] = [
    { href: "/?app=builds", title: "Builds", subtitle: "Products and tools", icon: "builds" },
    { href: "/?app=notes", title: "Notes", subtitle: "Writing on startups and engineering", icon: "notes" },
    { href: "/?app=sayhi", title: "Say Hi", subtitle: "Get in touch", icon: "sayhi" },
    { href: LINKEDIN_URL, title: "LinkedIn", subtitle: "Connect and follow along", icon: "linkedin" },
];

function DesktopAbout() {
    return (
        <div className={cx(ui.scroll, ui.fill)}>
            <article className={cx(ui.page, ui.pageNarrow)}>
                <ProfileHeader shell="desktop" withHeadline />
                <Section title="Background">
                    <div className={ui.stack} style={{ gap: 12 }}>
                        {PROFILE.about.map((para) => (
                            <p key={para} className={ui.body}>
                                {para}
                            </p>
                        ))}
                    </div>
                </Section>
                <Section title="Outside work">
                    <p className={ui.body}>{PROFILE.outsideWork}</p>
                </Section>
                <Section title="Elsewhere">
                    <DesktopLinkList
                        label="Elsewhere"
                        rows={ELSEWHERE.map((row) => ({ ...row, leading: <AppIcon icon={row.icon} size={28} /> }))}
                    />
                </Section>
            </article>
        </div>
    );
}

function PhoneAbout() {
    return (
        <div className={cx(ui.scroll, ui.phoneScroll)}>
            <div style={{ padding: "8px 16px 28px" }}>
                <ProfileHeader shell="phone" withHeadline />
            </div>
            <GroupedSection title="Background" card>
                <div className={ui.stack} style={{ gap: 12 }}>
                    {PROFILE.about.map((para) => (
                        <p key={para} className={ui.body}>
                            {para}
                        </p>
                    ))}
                </div>
            </GroupedSection>
            <GroupedSection title="Outside work" card>
                <p className={ui.body}>{PROFILE.outsideWork}</p>
            </GroupedSection>
            <GroupedSection title="Elsewhere">
                {ELSEWHERE.map((row) => (
                    <GroupedLinkRow
                        key={row.href}
                        href={row.href}
                        leading={<AppIcon icon={row.icon} size={30} />}
                        title={row.title}
                        subtitle={row.subtitle}
                    />
                ))}
            </GroupedSection>
        </div>
    );
}

export default function AboutView({ shell }: AppViewProps) {
    return (
        <AppRoot shell={shell} label="about" className={shell === "phone" ? profileStyles.phone : undefined}>
            {shell === "phone" ? <PhoneAbout /> : <DesktopAbout />}
        </AppRoot>
    );
}
