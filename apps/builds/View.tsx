"use client";

import { BUILDS, type Build } from "@/data/builds";
import type { AppViewProps } from "../views";
import {
    AppRoot,
    Bullets,
    Chips,
    cx,
    findById,
    GroupedButtonRow,
    GroupedSection,
    InfoStrip,
    LinkButton,
    PhoneStack,
    Section,
    Sidebar,
    ui,
} from "../_ui";
import { BuildIcon } from "./BuildIcon";
import s from "./builds.module.css";

const SHIPPED = BUILDS.filter((b) => !b.archived);
const ARCHIVED = BUILDS.filter((b) => b.archived);

const SECTIONS = [
    { id: "shipped", title: "Shipped", items: SHIPPED },
    ...(ARCHIVED.length ? [{ id: "archive", title: "Archive", items: ARCHIVED }] : []),
];

function facts(build: Build) {
    const cells = [{ label: "Type", value: build.type }];
    if (build.status) cells.push({ label: "Status", value: build.status });
    else if (build.archived) cells.push({ label: "Status", value: "Archived" });
    if (build.stack.length) cells.push({ label: "Stack", value: `${build.stack.length} ${build.stack.length === 1 ? "technology" : "technologies"}` });
    return cells;
}

/* ---------- desktop: source list + App Store-style product page ---------- */

function DesktopProductPage({ build }: { build: Build }) {
    return (
        <article className={cx(ui.page)} aria-labelledby={`build-${build.id}`}>
            <header className={s.hero}>
                <BuildIcon build={build} size={96} />
                <div className={s.heroText}>
                    <div className={s.nameRow}>
                        <h1 id={`build-${build.id}`} className={ui.title1}>
                            {build.name}
                        </h1>
                        {build.archived && <span className={ui.badge}>Archive</span>}
                    </div>
                    <p className={s.tagline}>{build.tagline}</p>
                    {build.link && (
                        <div className={s.actions}>
                            <LinkButton href={build.link.href}>{build.link.label}</LinkButton>
                        </div>
                    )}
                </div>
            </header>
            <InfoStrip cells={facts(build)} />
            <Section title="What it does" show={build.whatItDoes.length > 0}>
                <Bullets items={build.whatItDoes} />
            </Section>
            <Section title="Under the hood" show={build.underTheHood.length > 0}>
                <div className={s.hood}>
                    <Bullets items={build.underTheHood} />
                </div>
            </Section>
            <Section title="Built with" show={build.stack.length > 0}>
                <Chips items={build.stack} label={`${build.name} stack`} />
            </Section>
        </article>
    );
}

function DesktopBuilds({ item, openItem }: Pick<AppViewProps, "item" | "openItem">) {
    const build = findById(BUILDS, item) ?? BUILDS[0];
    return (
        <div className={ui.split}>
            <Sidebar
                label="Builds"
                sections={SECTIONS}
                selectedId={build.id}
                getId={(b) => b.id}
                onSelect={openItem}
                width={236}
                renderItem={(b) => (
                    <>
                        <BuildIcon build={b} size={20} />
                        <span className={cx(s.rowName, ui.truncate, b.archived && s.rowArchived)}>{b.name}</span>
                    </>
                )}
            />
            <div key={build.id} className={cx(ui.detail, ui.scroll)}>
                <DesktopProductPage build={build} />
            </div>
        </div>
    );
}

/* ---------- phone: inset-grouped list → product page ---------- */

function PhoneProductPage({ build }: { build: Build }) {
    return (
        <article className={ui.phoneDetail} aria-labelledby={`build-${build.id}`}>
            <header className={cx(s.hero, s.phoneHero)}>
                <BuildIcon build={build} size={104} />
                <div className={s.heroText}>
                    <h1 id={`build-${build.id}`} className={ui.title2}>
                        {build.name}
                    </h1>
                    <p className={s.tagline}>{build.type}</p>
                    {(build.link || build.archived) && (
                        <div className={s.actions}>
                            {build.link && <LinkButton href={build.link.href}>{build.link.label}</LinkButton>}
                            {build.archived && <span className={ui.badge}>Archive</span>}
                        </div>
                    )}
                </div>
            </header>
            <p className={s.phoneTagline}>{build.tagline}</p>
            <div className={s.phoneStrip}>
                <InfoStrip cells={facts(build).filter((c) => c.label !== "Type")} />
            </div>
            <Section title="What it does" show={build.whatItDoes.length > 0}>
                <div className={s.phoneCard}>
                    <Bullets items={build.whatItDoes} />
                </div>
            </Section>
            <Section title="Under the hood" show={build.underTheHood.length > 0}>
                <div className={s.phoneCard}>
                    <Bullets items={build.underTheHood} />
                </div>
            </Section>
            <Section title="Built with" show={build.stack.length > 0}>
                <div className={s.phoneChips}>
                    <Chips items={build.stack} label={`${build.name} stack`} />
                </div>
            </Section>
        </article>
    );
}

function PhoneBuilds({ item, openItem }: Pick<AppViewProps, "item" | "openItem">) {
    const build = findById(BUILDS, item);
    return (
        <PhoneStack
            detailKey={build?.id ?? null}
            detail={build && <PhoneProductPage build={build} />}
            list={SECTIONS.map((section) => (
                <GroupedSection key={section.id} title={section.title}>
                    {section.items.map((b) => (
                        <GroupedButtonRow
                            key={b.id}
                            onPress={() => openItem(b.id)}
                            leading={<BuildIcon build={b} size={44} />}
                            title={b.name}
                            subtitle={b.tagline}
                            strong
                        />
                    ))}
                </GroupedSection>
            ))}
        />
    );
}

export default function BuildsView({ shell, item, openItem }: AppViewProps) {
    return (
        <AppRoot shell={shell} label="builds">
            {shell === "phone" ? <PhoneBuilds item={item} openItem={openItem} /> : <DesktopBuilds item={item} openItem={openItem} />}
        </AppRoot>
    );
}
