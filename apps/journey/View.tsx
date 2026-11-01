"use client";

import { JOURNEY, type Role } from "@/data/journey";
import type { TileFinish } from "../icons";
import type { AppViewProps } from "../views";
import {
    AppRoot,
    Bullets,
    Chips,
    cx,
    findById,
    GroupedButtonRow,
    GroupedSection,
    MonogramTile,
    PhoneStack,
    Section,
    Sidebar,
    ui,
} from "../_ui";
import s from "./journey.module.css";

const FINISHES: TileFinish[] = ["blue", "deep", "sky", "graphite", "porcelain"];
const finishFor = (role: Role) => FINISHES[Math.max(0, JOURNEY.indexOf(role)) % FINISHES.length];
const isCurrent = (role: Role) => /present/i.test(role.period);

const NOW = JOURNEY.filter(isCurrent);
const EARLIER = JOURNEY.filter((r) => !isCurrent(r));

function RoleMark({ role, size }: { role: Role; size: number }) {
    return <MonogramTile letter={role.company} size={size} finish={finishFor(role)} />;
}

function Meta({ role }: { role: Role }) {
    return (
        <p className={s.meta}>
            <span>{role.period}</span>
            {role.location && (
                <>
                    <span aria-hidden="true">·</span>
                    <span>{role.location}</span>
                </>
            )}
            {isCurrent(role) && <span className={ui.badge}>Now</span>}
        </p>
    );
}

/* ---------- desktop: timeline + role page ---------- */

function DesktopRolePage({ role }: { role: Role }) {
    return (
        <article className={ui.page} aria-labelledby={`role-${role.id}`}>
            <header className={s.header}>
                <RoleMark role={role} size={64} />
                <div className={s.headerText}>
                    <h1 id={`role-${role.id}`} className={ui.title1}>
                        {role.company}
                    </h1>
                    <p className={s.role}>{role.title}</p>
                    <Meta role={role} />
                </div>
            </header>
            {role.summary && <p className={s.summary}>{role.summary}</p>}
            <Section title="Highlights" show={role.highlights.length > 0}>
                <Bullets items={role.highlights} />
            </Section>
            <Section title="Stack" show={role.stack.length > 0}>
                <Chips items={role.stack} label={`${role.company} stack`} />
            </Section>
        </article>
    );
}

function DesktopJourney({ item, openItem }: Pick<AppViewProps, "item" | "openItem">) {
    const role = findById(JOURNEY, item) ?? JOURNEY[0];
    return (
        <div className={ui.split}>
            <Sidebar
                label="Journey"
                sections={[{ id: "timeline", title: "Timeline", items: JOURNEY }]}
                selectedId={role.id}
                getId={(r) => r.id}
                getLabel={(r) => `${r.company}, ${r.title}, ${r.period}`}
                onSelect={openItem}
                width={240}
                renderItem={(r, { index, count }) => (
                    <span className={s.tlRow}>
                        <span className={cx(s.rail, index === 0 && s.railFirst, index === count - 1 && s.railLast)} aria-hidden="true">
                            <span className={cx(s.dot, isCurrent(r) && s.dotNow)} />
                        </span>
                        <span className={s.tlText}>
                            <span className={cx(s.tlCompany, ui.truncate)}>{r.company}</span>
                            <span className={cx(s.tlTitle, ui.truncate)}>{r.title}</span>
                            <span className={cx(s.tlPeriod, ui.truncate)}>{r.period}</span>
                        </span>
                    </span>
                )}
            />
            <div key={role.id} className={cx(ui.detail, ui.scroll)}>
                <DesktopRolePage role={role} />
            </div>
        </div>
    );
}

/* ---------- phone: grouped list → role page ---------- */

function PhoneRolePage({ role }: { role: Role }) {
    return (
        <article className={ui.phoneDetail} aria-labelledby={`role-${role.id}`}>
            <header className={cx(s.header, s.phoneHeader)}>
                <RoleMark role={role} size={72} />
                <div className={s.headerText}>
                    <h1 id={`role-${role.id}`} className={ui.title1}>
                        {role.company}
                    </h1>
                    <p className={s.role}>{role.title}</p>
                    <Meta role={role} />
                </div>
            </header>
            {role.summary && <p className={s.phoneSummary}>{role.summary}</p>}
            <Section title="Highlights" show={role.highlights.length > 0}>
                <div className={s.phoneCard}>
                    <Bullets items={role.highlights} />
                </div>
            </Section>
            <Section title="Stack" show={role.stack.length > 0}>
                <div className={s.phoneChips}>
                    <Chips items={role.stack} label={`${role.company} stack`} />
                </div>
            </Section>
        </article>
    );
}

function PhoneJourney({ item, openItem }: Pick<AppViewProps, "item" | "openItem">) {
    const role = findById(JOURNEY, item);
    const groups = [
        { id: "now", title: "Now", roles: NOW },
        { id: "earlier", title: "Earlier", roles: EARLIER },
    ].filter((g) => g.roles.length > 0);
    return (
        <PhoneStack
            detailKey={role?.id ?? null}
            detail={role && <PhoneRolePage role={role} />}
            list={groups.map((g) => (
                <GroupedSection key={g.id} title={g.title}>
                    {g.roles.map((r) => (
                        <GroupedButtonRow
                            key={r.id}
                            onPress={() => openItem(r.id)}
                            leading={<RoleMark role={r} size={40} />}
                            title={r.company}
                            subtitle={`${r.title} · ${r.period}`}
                            strong
                        />
                    ))}
                </GroupedSection>
            ))}
        />
    );
}

export default function JourneyView({ shell, item, openItem }: AppViewProps) {
    return (
        <AppRoot shell={shell} label="journey">
            {shell === "phone" ? <PhoneJourney item={item} openItem={openItem} /> : <DesktopJourney item={item} openItem={openItem} />}
        </AppRoot>
    );
}
