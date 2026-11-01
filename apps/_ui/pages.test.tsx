// @vitest-environment jsdom
import "./test/setup";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EMAIL, GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL } from "@/data/links";
import { BELIEFS, PROFILE } from "@/data/profile";
import AboutView from "../about/View";
import BeliefsView from "../beliefs/View";
import SayHiView from "../sayhi/View";
import { renderView } from "./test/render";

const SHELLS = ["desktop", "phone"] as const;

describe.each(SHELLS)("single-page apps — %s", (shell) => {
    it("About shows the profile and in-OS links", () => {
        renderView(AboutView, shell);
        expect(screen.getByRole("heading", { level: 1, name: PROFILE.name })).toBeTruthy();
        expect(screen.getByText(PROFILE.headline)).toBeTruthy();
        expect(document.querySelector("[data-initials=\"MH\"] img[src=\"/character/head.webp\"]")).toBeTruthy();
        expect(screen.getByText(PROFILE.outsideWork)).toBeTruthy();
        const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
        expect(hrefs).toEqual(expect.arrayContaining(["/?app=notes", "/?app=sayhi", "/?app=builds", LINKEDIN_URL]));
    });

    it("Beliefs lists every belief with its note link", () => {
        renderView(BeliefsView, shell);
        for (const b of BELIEFS) expect(screen.getByRole("heading", { name: b.title })).toBeTruthy();
        const noteLinks = screen.getAllByRole("link", { name: /Read the note/ });
        expect(noteLinks.map((a) => a.getAttribute("href"))).toEqual(BELIEFS.filter((b) => b.link).map((b) => b.link!.href));
    });

    it("Say Hi leads with LinkedIn and offers the other channels", () => {
        renderView(SayHiView, shell);
        expect(screen.getByText(/best place to reach me is LinkedIn/)).toBeTruthy();
        const primary = screen.getByRole("link", { name: /Message me on LinkedIn/ });
        expect(primary.getAttribute("href")).toBe(LINKEDIN_URL);
        expect(primary.getAttribute("target")).toBe("_blank");
        for (const topic of PROFILE.sayHiTopics) expect(screen.getByText(topic)).toBeTruthy();
        const hrefs = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
        expect(hrefs).toEqual(expect.arrayContaining([`mailto:${EMAIL}`, GITHUB_URL, INSTAGRAM_URL, "/?app=notes"]));
    });
});
