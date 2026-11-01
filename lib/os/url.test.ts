import { describe, expect, it } from "vitest";
import { parseOsUrl, serializeOsUrl, withClosed, withOpened } from "./url";

describe("parseOsUrl", () => {
    it.each([
        ["", { open: [], focus: null, item: null, challenge: null }],
        ["?app=builds&item=whatsapp-crm", { open: ["builds"], focus: "builds", item: "whatsapp-crm", challenge: null }],
        ["?w=builds,notes&focus=builds", { open: ["builds", "notes"], focus: "builds", item: null, challenge: null }],
        ["?w=builds,builds,nope", { open: ["builds"], focus: "builds", item: null, challenge: null }],
        ["?w=notes&focus=builds", { open: ["notes"], focus: "notes", item: null, challenge: null }],
        ["?app=linkedin", { open: [], focus: null, item: null, challenge: null }],
        ["?app=builds&item=../etc", { open: ["builds"], focus: "builds", item: null, challenge: null }],
        ["?item=crm", { open: [], focus: null, item: null, challenge: null }],
        ["?app=bughunt&challenge=47", { open: ["bughunt"], focus: "bughunt", item: null, challenge: 47 }],
        ["?app=bughunt&challenge=9999", { open: ["bughunt"], focus: "bughunt", item: null, challenge: 200 }],
        ["?app=bughunt&challenge=-3", { open: ["bughunt"], focus: "bughunt", item: null, challenge: null }],
        ["?app=builds&challenge=47", { open: ["builds"], focus: "builds", item: null, challenge: null }],
    ])("%s", (search, expected) => {
        expect(parseOsUrl(search)).toEqual(expected);
    });
});

describe("serializeOsUrl", () => {
    it("round-trips desktop and phone shapes", () => {
        const desktop = parseOsUrl("?w=builds,notes&focus=notes&item=x1");
        expect(serializeOsUrl(desktop, "desktop")).toBe("/?w=builds,notes&focus=notes&item=x1");
        expect(serializeOsUrl(desktop, "phone")).toBe("/?app=notes&item=x1");
        expect(serializeOsUrl(parseOsUrl(""), "desktop")).toBe("/");
    });
});

describe("open/close", () => {
    it("phone keeps one app, desktop keeps a set", () => {
        const s = withOpened(parseOsUrl("?app=builds"), "notes", "phone");
        expect(s.open).toEqual(["notes"]);
        const d = withOpened(parseOsUrl("?w=builds"), "notes", "desktop");
        expect(d.open).toEqual(["builds", "notes"]);
    });

    it("closing the focused window moves focus to the last open one and drops its item", () => {
        const s = withClosed(parseOsUrl("?w=builds,notes&focus=notes&item=a"), "notes");
        expect(s).toEqual({ open: ["builds"], focus: "builds", item: null, challenge: null });
    });

    it("closing an unfocused window keeps focus and item", () => {
        const s = withClosed(parseOsUrl("?w=builds,notes&focus=notes&item=a"), "builds");
        expect(s).toEqual({ open: ["notes"], focus: "notes", item: "a", challenge: null });
    });
});
