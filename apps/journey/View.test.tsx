// @vitest-environment jsdom
import "../_ui/test/setup";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JOURNEY } from "@/data/journey";
import { renderView } from "../_ui/test/render";
import JourneyView from "./View";

const current = () => document.querySelector('[aria-current="true"]');

describe("Journey — desktop", () => {
    it("selects the latest role by default", () => {
        renderView(JourneyView, "desktop");
        expect(current()?.textContent).toContain(JOURNEY[0].company);
        expect(screen.getByRole("heading", { level: 1, name: JOURNEY[0].company })).toBeTruthy();
    });

    it("selects the item passed and calls openItem on click", () => {
        const { openItem } = renderView(JourneyView, "desktop", "study-medic");
        expect(screen.getByRole("heading", { level: 1, name: "Study Medic" })).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: /Brototype/ }));
        expect(openItem).toHaveBeenCalledWith("brototype");
    });

    it("hides empty highlights and stack (Exthgen)", () => {
        renderView(JourneyView, "desktop", "exthgen");
        expect(screen.getByRole("heading", { level: 1, name: "Exthgen" })).toBeTruthy();
        expect(screen.queryByRole("heading", { name: "Highlights" })).toBeNull();
        expect(screen.queryByRole("heading", { name: "Stack" })).toBeNull();
    });

    it("falls back to the first role for an unknown item", () => {
        renderView(JourneyView, "desktop", "unknown-role");
        expect(screen.getByRole("heading", { level: 1, name: JOURNEY[0].company })).toBeTruthy();
    });

    it("moves the selection up with the arrow keys", () => {
        const { openItem } = renderView(JourneyView, "desktop", "independent");
        const selected = current() as HTMLElement;
        selected.focus();
        fireEvent.keyDown(selected, { key: "ArrowUp" });
        expect(openItem).toHaveBeenCalledWith("exthgen");
    });
});

describe("Journey — phone", () => {
    it("lists roles and pushes on tap", () => {
        const { openItem } = renderView(JourneyView, "phone");
        expect(screen.getByRole("heading", { name: "Now" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Earlier" })).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: /Dentobees/ }));
        expect(openItem).toHaveBeenCalledWith("dentobees");
    });

    it("shows the role page for the item", () => {
        renderView(JourneyView, "phone", "dentobees");
        expect(screen.getByRole("heading", { level: 1, name: "Dentobees" })).toBeTruthy();
        expect(screen.getByRole("heading", { name: "Highlights" })).toBeTruthy();
    });

    it("falls back to the list for an unknown item", () => {
        renderView(JourneyView, "phone", "nope");
        expect(screen.getByRole("heading", { name: "Now" })).toBeTruthy();
    });
});
