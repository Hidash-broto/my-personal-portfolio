"use client";

import { Camera, Check, CodeXml, Mail, NotebookText, type LucideIcon } from "lucide-react";
import { EMAIL, GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL } from "@/data/links";
import { PROFILE } from "@/data/profile";
import type { ShellKind } from "@/lib/os";
import type { AppViewProps } from "../views";
import { AppRoot, cx, LinkButton, ProfileHeader, profileStyles, Section, ui } from "../_ui";
import s from "./sayhi.module.css";

interface Action {
    label: string;
    href: string;
    icon: LucideIcon;
    /** Spoken name, when the visible label is not enough. */
    description: string;
}

const ACTIONS: Action[] = [
    { label: "Email", href: `mailto:${EMAIL}`, icon: Mail, description: `Email ${EMAIL}` },
    { label: "GitHub", href: GITHUB_URL, icon: CodeXml, description: "GitHub profile" },
    { label: "Instagram", href: INSTAGRAM_URL, icon: Camera, description: "Instagram" },
    { label: "Notes", href: "/?app=notes", icon: NotebookText, description: "Read my notes" },
];

function Card({ shell }: { shell: ShellKind }) {
    const phone = shell === "phone";
    return (
        <>
            <ProfileHeader shell={shell} />

            <div className={s.primary}>
                <p className={s.primaryText}>The best place to reach me is LinkedIn.</p>
                <LinkButton href={LINKEDIN_URL} block>
                    Message me on LinkedIn
                </LinkButton>
            </div>

            <Section title="Happy to talk about">
                <div className={phone ? s.phoneCard : undefined}>
                    <ul className={s.topics}>
                        {PROFILE.sayHiTopics.map((topic) => (
                            <li key={topic} className={s.topic}>
                                <span className={s.tick} aria-hidden="true">
                                    <Check size={phone ? 13 : 11} strokeWidth={3.2} />
                                </span>
                                <span>{topic}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </Section>

            <Section title="Elsewhere">
                <ul className={s.actions}>
                    {ACTIONS.map(({ label, href, icon: Icon, description }) => {
                        const external = /^https?:\/\//.test(href);
                        return (
                            <li key={label}>
                                <a
                                    className={s.action}
                                    href={href}
                                    aria-label={external ? `${description} (opens in a new tab)` : description}
                                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                >
                                    <Icon className={s.actionIcon} aria-hidden="true" strokeWidth={2} />
                                    <span className={s.actionLabel}>{label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </Section>
        </>
    );
}

export default function SayHiView({ shell }: AppViewProps) {
    const phone = shell === "phone";
    return (
        <AppRoot shell={shell} label="sayhi" className={cx(phone && profileStyles.phone, phone && s.phone)}>
            <div className={cx(ui.scroll, phone ? ui.phoneScroll : ui.fill)}>
                <div className={phone ? s.phoneWrap : s.wrap}>
                    <Card shell={shell} />
                </div>
            </div>
        </AppRoot>
    );
}
