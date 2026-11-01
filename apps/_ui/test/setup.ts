import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

/** Shared jsdom setup for app view tests. Import it first in each view test file. */
afterEach(() => {
    cleanup();
});

if (typeof window !== "undefined" && !window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}
