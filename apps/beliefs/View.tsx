"use client";

import { BELIEFS } from "@/data/profile";
import type { AppViewProps } from "../views";
import { AppRoot, Chevron, cx, SR_ONLY, TextLink, ui } from "../_ui";
import s from "./beliefs.module.css";

function DesktopBeliefs() {
    return (
        <div className={cx(ui.scroll, ui.fill)}>
            <div className={cx(ui.page, ui.pageNarrow)}>
                <ul className={s.list}>
                    {BELIEFS.map((b) => (
                        <li key={b.id} className={s.belief}>
                            <span className={s.mark} aria-hidden="true" />
                            <h2 id={`belief-${b.id}`} className={s.title}>
                                {b.title}
                            </h2>
                            <p className={s.text}>{b.body}</p>
                            {b.link && (
                                <p className={s.more}>
                                    <TextLink href={b.link.href}>
                                        {b.link.label}
                                        <span style={SR_ONLY}>: {b.title}</span>
                                    </TextLink>
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function PhoneBeliefs() {
    return (
        <div className={cx(ui.scroll, ui.phoneScroll)}>
            <ul className={s.cards}>
                {BELIEFS.map((b) => (
                    <li key={b.id} className={s.card}>
                        <div className={s.cardBody}>
                            <h2 id={`belief-${b.id}`} className={s.title}>
                                {b.title}
                            </h2>
                            <p className={s.text}>{b.body}</p>
                        </div>
                        {b.link && (
                            <a className={s.cardLink} href={b.link.href}>
                                <span>
                                    {b.link.label}
                                    <span style={SR_ONLY}>: {b.title}</span>
                                </span>
                                <Chevron />
                            </a>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function BeliefsView({ shell }: AppViewProps) {
    return <AppRoot shell={shell} label="beliefs">{shell === "phone" ? <PhoneBeliefs /> : <DesktopBeliefs />}</AppRoot>;
}
