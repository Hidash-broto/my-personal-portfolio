/**
 * Test-only fake of the OS context. Tests mock `useOs` from "@/lib/os" with `useFakeOs`:
 *
 *   vi.mock("@/lib/os", async (importOriginal) => ({
 *       ...(await importOriginal<typeof import("@/lib/os")>()),
 *       useOs: (await import("./test-utils")).useFakeOs,
 *   }));
 *
 * Must not import "@/lib/os" at runtime (it is the mocked module).
 */
import { render, type RenderOptions } from "@testing-library/react";
import { createContext, useContext, useMemo, useState, type ReactElement, type ReactNode } from "react";
import { vi } from "vitest";
import type { WindowAppId } from "@/apps/registry";
import type { OsHistory, OsUrlState } from "@/lib/os";

interface FakeOsValue {
    shell: "desktop";
    history: OsHistory;
    url: OsUrlState;
}

const FakeOsContext = createContext<FakeOsValue | null>(null);

export function useFakeOs(): FakeOsValue {
    const value = useContext(FakeOsContext);
    if (!value) throw new Error("useFakeOs must be used inside renderWithFakeOs");
    return value;
}

export interface FakeHistoryCalls {
    open: ReturnType<typeof vi.fn>;
    close: ReturnType<typeof vi.fn>;
    focus: ReturnType<typeof vi.fn>;
}

/** Renders `ui` with a stateful fake history that records calls and updates the URL state like the real one. */
export function renderWithFakeOs(ui: ReactElement, initial: Partial<OsUrlState> = {}, options?: Omit<RenderOptions, "wrapper">) {
    const calls: FakeHistoryCalls = { open: vi.fn(), close: vi.fn(), focus: vi.fn() };
    const start: OsUrlState = { open: [], focus: null, item: null, challenge: null, ...initial };
    if (start.focus === null && start.open.length) start.focus = start.open.at(-1) ?? null;
    const box = { current: start };

    function Provider({ children }: { children: ReactNode }) {
        const [url, setUrl] = useState<OsUrlState>(start);
        const history = useMemo(() => {
            const update = (fn: (s: OsUrlState) => OsUrlState) => {
                box.current = fn(box.current);
                setUrl(box.current);
            };
            const fake = {
                state: () => box.current,
                landing: () => ({ deepLink: false }),
                onPopState: () => {},
                open(app: WindowAppId, item: string | null = null) {
                    calls.open(app, item);
                    update((s) => ({ open: [...s.open.filter((a) => a !== app), app], focus: app, item, challenge: null }));
                },
                close(app: WindowAppId) {
                    calls.close(app);
                    update((s) => {
                        const open = s.open.filter((a) => a !== app);
                        return { open, focus: s.focus === app ? (open.at(-1) ?? null) : s.focus, item: s.focus === app ? null : s.item, challenge: null };
                    });
                },
                focus(app: WindowAppId) {
                    calls.focus(app);
                    update((s) => (s.open.includes(app) ? { ...s, focus: app } : s));
                },
            };
            return fake as unknown as OsHistory;
        }, []);
        const value = useMemo<FakeOsValue>(() => ({ shell: "desktop", history, url }), [history, url]);
        return <FakeOsContext.Provider value={value}>{children}</FakeOsContext.Provider>;
    }

    return { ...render(ui, { wrapper: Provider, ...options }), calls, url: () => box.current };
}
