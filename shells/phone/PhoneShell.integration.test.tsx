// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OsProvider } from "@/lib/os";
import PhoneShell from "./PhoneShell";

vi.mock("@/apps/views", async () => {
    const { WINDOW_APP_IDS } = await import("@/apps/registry");
    return { APP_VIEWS: Object.fromEntries(WINDOW_APP_IDS.map((id) => [id, () => <p data-testid={`view-${id}`}>{id}</p>])) };
});

afterEach(() => {
    cleanup();
    window.history.replaceState(null, "", "/");
});

describe("PhoneShell with the real OS history", () => {
    it("icon tap -> ?app=journey -> sheet; Back -> home again", async () => {
        render(
            <OsProvider shell="phone">
                <PhoneShell />
            </OsProvider>,
        );

        fireEvent.click(screen.getByRole("button", { name: "Journey" }));
        expect(window.location.search).toBe("?app=journey");
        expect(await screen.findByRole("dialog", { name: "Journey" })).toBeTruthy();

        await act(async () => {
            fireEvent.click(screen.getByRole("button", { name: "Back to home screen" }));
        });
        await waitFor(() => expect(window.location.search).toBe(""));
        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Journey" })).toBeNull(), { timeout: 4000 });
    });
});
