// @vitest-environment jsdom
import { act, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { useState } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { MenuBar } from "./MenuBar";
import type { Overlay } from "./overlay";
import { renderWithFakeOs } from "./test-utils";
import { useDesktopActions } from "./use-desktop-actions";

vi.mock("@/lib/os", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/os")>()),
    useOs: (await import("./test-utils")).useFakeOs,
}));

function Harness() {
    const [overlay, setOverlay] = useState<Overlay>(null);
    const actions = useDesktopActions();
    return (
        <>
            <MenuBar overlay={overlay} setOverlay={setOverlay} actions={actions} />
            <output data-testid="overlay">{overlay ? overlay.kind : "none"}</output>
            <button type="button">outside</button>
        </>
    );
}

beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
});
afterEach(cleanup);

const title = (name: string) => screen.getByRole("menuitem", { name });
const active = () => document.activeElement as HTMLElement;

describe("MenuBar keyboard navigation", () => {
    it("opens with ArrowDown, moves with arrows (skipping disabled items), switches menus, and closes with Esc", async () => {
        renderWithFakeOs(<Harness />);

        title("File").focus();
        fireEvent.keyDown(title("File"), { key: "ArrowDown" });
        expect(screen.getByRole("menu", { name: "File" })).toBeTruthy();
        expect(active().textContent).toContain("Open Builds");

        fireEvent.keyDown(active(), { key: "ArrowDown" });
        expect(active().textContent).toContain("Open Journey");

        // "Close Window" is disabled with no windows open: ArrowDown wraps past it.
        fireEvent.keyDown(active(), { key: "ArrowDown" });
        expect(active().textContent).toContain("Open Builds");

        fireEvent.keyDown(active(), { key: "ArrowUp" });
        expect(active().textContent).toContain("Open Journey");

        // ArrowRight moves to the Edit menu and focuses its first enabled item.
        fireEvent.keyDown(active(), { key: "ArrowRight" });
        expect(screen.getByRole("menu", { name: "Edit" })).toBeTruthy();
        expect(title("File").getAttribute("aria-expanded")).toBe("false");
        await waitFor(() => expect(screen.queryByRole("menu", { name: "File" })).toBeNull());
        expect(title("Edit").getAttribute("aria-expanded")).toBe("true");

        await act(async () => {
            fireEvent.keyDown(active(), { key: "Escape" });
        });
        expect(active()).toBe(title("Edit"));
        expect(title("Edit").getAttribute("aria-expanded")).toBe("false");
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    });

    it("activates an item with Enter: File › Open Builds opens Builds", async () => {
        const { calls } = renderWithFakeOs(<Harness />);
        title("File").focus();
        fireEvent.keyDown(title("File"), { key: "ArrowDown" });
        fireEvent.click(active());
        expect(calls.open).toHaveBeenCalledWith("builds", null);
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    });

    it("switches menus on hover while one is open, and closes on an outside click", () => {
        renderWithFakeOs(<Harness />);
        fireEvent.click(title("View"));
        expect(screen.getByRole("menu", { name: "View" })).toBeTruthy();

        fireEvent.pointerOver(title("Help"));
        expect(screen.getByRole("menu", { name: "Help" })).toBeTruthy();
        expect(screen.getByRole("menuitem", { name: "Say Hi" })).toBeTruthy();

        fireEvent.pointerDown(screen.getByRole("button", { name: "outside" }));
        expect(screen.getByTestId("overlay").textContent).toBe("none");
    });

    it("lists open windows in the Window menu and never shows OS-reserved shortcuts", () => {
        renderWithFakeOs(<Harness />, { open: ["builds", "notes"], focus: "notes" });
        fireEvent.click(title("Window"));
        const menu = screen.getByRole("menu", { name: "Window" });
        expect(menu.textContent).toContain("Builds");
        expect(screen.getByRole("menuitemcheckbox", { name: /Notes/ }).getAttribute("aria-checked")).toBe("true");
        for (const reserved of ["⌘W", "⌘Q", "⌘M", "⌘H", "⌘N"]) expect(document.body.textContent).not.toContain(reserved);
    });
});
