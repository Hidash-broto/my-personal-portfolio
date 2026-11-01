import { describe, expect, it } from "vitest";
import { APPS, APP_IDS, desktopDockApps, phoneDockApps, phoneGridApps, WINDOW_APP_IDS } from "./registry";
import { BUG_IDS, bugMask, bugsFromMask } from "@/data/bugs";

describe("app registry", () => {
    it("ids are unique and every app lands somewhere on both shells", () => {
        expect(new Set(APP_IDS).size).toBe(APP_IDS.length);
        expect([...phoneGridApps, ...phoneDockApps].map((a) => a.id).sort()).toEqual([...APP_IDS].sort());
        expect(desktopDockApps.length).toBe(APPS.length);
    });

    it("external apps are not window apps", () => {
        expect(WINDOW_APP_IDS).not.toContain("linkedin");
    });
});

describe("bug mask", () => {
    it("round-trips through the bitmask", () => {
        expect(bugsFromMask(bugMask(["todo", "secret"])).map((b) => b.id)).toEqual(["todo", "secret"]);
        expect(bugMask(BUG_IDS)).toBe((1 << BUG_IDS.length) - 1);
    });
});
