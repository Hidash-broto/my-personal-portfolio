// @vitest-environment jsdom
import { cleanup, fireEvent, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "framer-motion";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { os, useOsStore } from "@/lib/os";
import { useItemOwner } from "./item-owner";
import { renderWithFakeOs } from "./test-utils";
import { WindowLayer } from "./WindowLayer";

vi.mock("@/lib/os", async (importOriginal) => ({
    ...(await importOriginal<typeof import("@/lib/os")>()),
    useOs: (await import("./test-utils")).useFakeOs,
}));

vi.mock("@/apps/views", () => {
    const view = (name: string) =>
        function View({ item }: { item: string | null }) {
            return <p>{`${name} view${item ? ` · ${item}` : ""}`}</p>;
        };
    return {
        APP_VIEWS: {
            journey: view("journey"),
            builds: view("builds"),
            about: view("about"),
            beliefs: view("beliefs"),
            notes: view("notes"),
            sayhi: view("sayhi"),
            bughunt: view("bughunt"),
        },
    };
});

beforeAll(() => {
    MotionGlobalConfig.skipAnimations = true;
});
beforeEach(() => {
    useOsStore.setState({ windows: {}, topZ: 10, mode: "normal" });
    useItemOwner.setState({ owner: null });
});
afterEach(cleanup);

describe("desktop windows", () => {
    it("renders one window per open app with geometry from the store", async () => {
        renderWithFakeOs(<WindowLayer />, { open: ["builds", "notes"], focus: "notes" });
        expect(await screen.findByRole("dialog", { name: "Builds" })).toBeTruthy();
        expect(screen.getByRole("dialog", { name: "Notes" })).toBeTruthy();
        const { windows } = useOsStore.getState();
        expect(windows.builds && windows.notes).toBeTruthy();
        expect(windows.notes!.z).toBeGreaterThan(windows.builds!.z);
    });

    it("close calls history.close, emits app:close, keeps the other windows and forgets geometry", async () => {
        const onClose = vi.fn();
        const off = os.on("app:close", onClose);
        const { calls, url } = renderWithFakeOs(<WindowLayer />, { open: ["builds", "notes"], focus: "notes" });

        fireEvent.click(await screen.findByRole("button", { name: "Close Builds" }));

        expect(calls.close).toHaveBeenCalledWith("builds");
        expect(calls.close).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledWith({ app: "builds" });
        expect(url().open).toEqual(["notes"]);

        await waitFor(() => expect(screen.queryByRole("dialog", { name: "Builds" })).toBeNull());
        expect(screen.getByRole("dialog", { name: "Notes" })).toBeTruthy();
        await waitFor(() => expect(useOsStore.getState().windows.builds).toBeUndefined());
        expect(useOsStore.getState().windows.notes).toBeTruthy();
        off();
    });

    it("minimize keeps the URL, flags the geometry and hands focus to the next window", async () => {
        const { calls, url } = renderWithFakeOs(<WindowLayer />, { open: ["builds", "notes"], focus: "notes" });
        fireEvent.click(await screen.findByRole("button", { name: "Minimize Notes" }));
        expect(useOsStore.getState().windows.notes?.minimized).toBe(true);
        expect(calls.close).not.toHaveBeenCalled();
        expect(url().open).toEqual(["builds", "notes"]);
        expect(calls.focus).toHaveBeenCalledWith("builds");
    });

    it("gives the URL item only to the window that owns it", async () => {
        renderWithFakeOs(<WindowLayer />, { open: ["builds"], focus: "builds", item: "whatsapp-crm" });
        expect(await screen.findByText("builds view · whatsapp-crm")).toBeTruthy();
    });

    it("double-clicking the title bar zooms", async () => {
        renderWithFakeOs(<WindowLayer />, { open: ["about"] });
        const dialog = await screen.findByRole("dialog", { name: "About" });
        fireEvent.doubleClick(dialog.querySelector("header")!);
        expect(useOsStore.getState().windows.about?.zoomed).toBe(true);
    });
});
