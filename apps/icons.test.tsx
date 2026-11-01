// @vitest-environment jsdom
import "./_ui/test/setup";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppIcon, SQUIRCLE_PATH } from "./icons";
import { APPS, type IconKey } from "./registry";

const ALL_KEYS: IconKey[] = ["journey", "builds", "about", "beliefs", "notes", "sayhi", "bughunt", "linkedin"];

describe("AppIcon", () => {
    it("covers every icon the registry uses", () => {
        for (const app of APPS) expect(ALL_KEYS).toContain(app.icon);
    });

    it.each(ALL_KEYS)("renders %s as a decorative square svg of the requested size", (icon) => {
        const { container } = render(<AppIcon icon={icon} size={56} />);
        const svg = container.querySelector("svg")!;
        expect(svg).not.toBeNull();
        expect(svg.getAttribute("aria-hidden")).toBe("true");
        expect(svg.getAttribute("width")).toBe("56");
        expect(svg.getAttribute("height")).toBe("56");
        // The body is clipped to the squircle and the glyph sits on top of it.
        expect(container.querySelector("clipPath path")?.getAttribute("d")).toBe(SQUIRCLE_PATH);
        expect(container.querySelectorAll("g[filter]").length).toBe(1);
    });

    it("gives each instance its own gradient ids", () => {
        const { container } = render(
            <>
                <AppIcon icon="notes" size={40} />
                <AppIcon icon="notes" size={40} />
            </>,
        );
        const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
        expect(ids.length).toBeGreaterThan(0);
        expect(new Set(ids).size).toBe(ids.length);
        for (const id of ids) expect(id).toMatch(/^[a-zA-Z0-9-]+$/);
    });

    it("draws a closed squircle in the 100-unit box", () => {
        expect(SQUIRCLE_PATH.startsWith("M")).toBe(true);
        expect(SQUIRCLE_PATH.endsWith("Z")).toBe(true);
        expect(SQUIRCLE_PATH).not.toMatch(/NaN|Infinity/);
    });
});
