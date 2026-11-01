import { describe, expect, it } from "vitest";
import { createOsHistory, type HistoryPort } from "./history";

/** In-memory browser history: entries + index, like the real thing. */
function fakeHistory(start = "/") {
    const entries = [start];
    let index = 0;
    const port: HistoryPort = {
        current: () => entries[index],
        push: (url) => {
            entries.splice(index + 1, Infinity, url);
            index += 1;
        },
        replace: (url) => {
            entries[index] = url;
        },
        back: () => {
            if (index > 0) index -= 1;
        },
    };
    return { port, entries: () => entries.slice(0, index + 1) };
}

describe("createOsHistory (desktop)", () => {
    it("open Builds, open Notes, close Builds keeps Notes open (outside voice #1)", () => {
        const h = fakeHistory();
        const os = createOsHistory("desktop", h.port);
        os.landing();
        os.open("builds");
        os.open("notes");
        os.close("builds");
        expect(h.port.current()).toBe("/?w=notes&focus=notes");
        expect(os.state().open).toEqual(["notes"]);
    });

    it("closing the most recent window goes back instead of piling up entries", () => {
        const h = fakeHistory();
        const os = createOsHistory("desktop", h.port);
        os.landing();
        os.open("builds");
        os.open("notes");
        os.close("notes");
        expect(h.entries()).toEqual(["/", "/?w=builds&focus=builds"]);
        os.close("builds");
        expect(h.entries()).toEqual(["/"]);
    });

    it("changing the item inside the focused app replaces (sidebar arrow keys)", () => {
        const h = fakeHistory();
        const os = createOsHistory("desktop", h.port);
        os.landing();
        os.open("builds");
        os.open("builds", "agentview");
        os.open("builds", "software-factory");
        expect(h.entries()).toEqual(["/", "/?w=builds&focus=builds&item=software-factory"]);
    });

    it("focus replaces the current entry", () => {
        const h = fakeHistory();
        const os = createOsHistory("desktop", h.port);
        os.landing();
        os.open("builds");
        os.open("notes");
        os.focus("builds");
        expect(h.entries()).toEqual(["/", "/?w=builds&focus=builds", "/?w=builds,notes&focus=builds"]);
    });
});

describe("createOsHistory (phone)", () => {
    it("deep link inserts a base entry so the first back stays on the site", () => {
        const h = fakeHistory("/?app=builds&item=whatsapp-crm");
        const os = createOsHistory("phone", h.port);
        expect(os.landing()).toEqual({ deepLink: true });
        expect(h.entries()).toEqual(["/", "/?app=builds&item=whatsapp-crm"]);
        os.close("builds");
        expect(h.entries()).toEqual(["/"]);
    });

    it("switching apps replaces, so closing always lands on the home screen with no stale entry", () => {
        const h = fakeHistory();
        const os = createOsHistory("phone", h.port);
        os.landing();
        os.open("builds");
        os.open("notes");
        expect(h.entries()).toEqual(["/", "/?app=notes"]);
        os.close("notes");
        expect(h.entries()).toEqual(["/"]);
    });

    it("re-syncs after a browser back", () => {
        const h = fakeHistory();
        const os = createOsHistory("phone", h.port);
        os.landing();
        os.open("builds");
        h.port.back();
        os.onPopState();
        os.open("notes");
        os.close("notes");
        expect(h.entries()).toEqual(["/"]);
    });
});
