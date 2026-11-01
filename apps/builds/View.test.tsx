// @vitest-environment jsdom
import "../_ui/test/setup";
import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BUILDS } from "@/data/builds";
import { renderView } from "../_ui/test/render";
import BuildsView from "./View";

const current = () => document.querySelector('[aria-current="true"]');

describe("Builds — desktop", () => {
    it("selects the first build when no item is given", () => {
        renderView(BuildsView, "desktop");
        expect(current()?.textContent).toContain(BUILDS[0].name);
        expect(screen.getByRole("heading", { level: 1, name: BUILDS[0].name })).toBeTruthy();
    });

    it("shows the build passed as item, including archived ones", () => {
        renderView(BuildsView, "desktop", "foodbia");
        expect(current()?.textContent).toContain("Foodbia");
        expect(screen.getByRole("heading", { level: 1, name: "Foodbia" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Archive" })).toBeTruthy();
    });

    it("falls back to the first build for an unknown item", () => {
        renderView(BuildsView, "desktop", "does-not-exist");
        expect(screen.getByRole("heading", { level: 1, name: BUILDS[0].name })).toBeTruthy();
    });

    it("calls openItem when a sidebar row is clicked", () => {
        const { openItem } = renderView(BuildsView, "desktop");
        const nav = screen.getByRole("navigation", { name: "Builds" });
        fireEvent.click(within(nav).getByRole("button", { name: /agentview/ }));
        expect(openItem).toHaveBeenCalledWith("agentview");
    });

    it("moves the selection with the arrow keys", () => {
        const { openItem } = renderView(BuildsView, "desktop");
        const selected = current() as HTMLElement;
        selected.focus();
        fireEvent.keyDown(selected, { key: "ArrowDown" });
        expect(openItem).toHaveBeenCalledWith(BUILDS[1].id);
        fireEvent.keyDown(selected, { key: "End" });
        expect(openItem).toHaveBeenLastCalledWith(BUILDS[BUILDS.length - 1].id);
    });

    it("renders the product page sections and an external primary link", () => {
        renderView(BuildsView, "desktop", "whatsapp-crm");
        expect(screen.getByRole("heading", { name: "What it does" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Under the hood" })).toBeTruthy();
        const link = screen.getByRole("link", { name: /Visit salestrack.in/ });
        expect(link.getAttribute("target")).toBe("_blank");
        expect(link.getAttribute("rel")).toContain("noopener");
        expect(screen.getByRole("list", { name: /stack/ }).textContent).toContain("BullMQ");
    });

    it("hides empty sections", () => {
        renderView(BuildsView, "desktop", "hiverr-ai");
        expect(screen.queryByRole("heading", { name: "Under the hood" })).toBeNull();
    });
});

describe("Builds — phone", () => {
    it("shows the grouped list when no item is selected and pushes on tap", () => {
        const { openItem } = renderView(BuildsView, "phone");
        expect(screen.getByRole("heading", { name: "Shipped" })).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: /Software Factory/ }));
        expect(openItem).toHaveBeenCalledWith("software-factory");
    });

    it("shows the detail page for the item", () => {
        renderView(BuildsView, "phone", "software-factory");
        expect(screen.getByRole("heading", { level: 1, name: "Software Factory" })).toBeTruthy();
        expect(screen.queryByRole("heading", { name: "Shipped" })).toBeNull();
    });

    it("falls back to the list for an unknown item", () => {
        renderView(BuildsView, "phone", "nope");
        expect(screen.getByRole("heading", { name: "Shipped" })).toBeTruthy();
    });

    it("goes back to the list when the item clears", () => {
        const { rerenderWith } = renderView(BuildsView, "phone", "agentview");
        rerenderWith(null);
        expect(screen.getByRole("heading", { name: "Shipped" })).toBeTruthy();
    });
});
