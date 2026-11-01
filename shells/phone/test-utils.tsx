/**
 * Test helpers for the phone shell: a fake `useOs()` value with spy history, so shell
 * components can be rendered without a real browser history. Test-only (never imported by the app).
 */
import { vi } from "vitest";
import type { WindowAppId } from "@/apps/registry";
// Type-only: this file is loaded from inside a vi.mock("@/lib/os") factory, so it must not import that module's values.
import type { OsHistory, OsUrlState } from "@/lib/os";

const EMPTY_STATE: OsUrlState = { open: [], focus: null, item: null, challenge: null };

export interface FakeOs {
    shell: "phone";
    history: OsHistory & {
        open: ReturnType<typeof vi.fn<(app: WindowAppId, item?: string | null) => void>>;
        close: ReturnType<typeof vi.fn<(app: WindowAppId) => void>>;
    };
    url: OsUrlState;
}

let current: FakeOs | null = null;

export function createFakeOs(url: Partial<OsUrlState> = {}): FakeOs {
    const state: OsUrlState = { ...EMPTY_STATE, ...url, focus: url.focus ?? url.open?.at(-1) ?? null };
    const history = {
        state: vi.fn(() => state),
        landing: vi.fn(() => ({ deepLink: false })),
        open: vi.fn<(app: WindowAppId, item?: string | null) => void>(),
        close: vi.fn<(app: WindowAppId) => void>(),
        focus: vi.fn(),
        onPopState: vi.fn(),
    };
    current = { shell: "phone", history, url: state };
    return current;
}

/** Drop-in replacement for `useOs` (wire it with vi.mock("@/lib/os", ...)). */
export function fakeUseOs(): FakeOs {
    if (!current) throw new Error("call createFakeOs() before rendering");
    return current;
}
