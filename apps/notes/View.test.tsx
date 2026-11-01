// @vitest-environment jsdom
import "../_ui/test/setup";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { posts } from "@/data/posts";
import { renderView } from "../_ui/test/render";
import NotesView from "./View";

const newest = [...posts].sort((a, b) => b.date.localeCompare(a.date))[0];
const oldest = [...posts].sort((a, b) => a.date.localeCompare(b.date))[0];
const current = () => document.querySelector('[aria-current="true"]');

describe("Notes — desktop", () => {
    it("opens the newest note by default", () => {
        renderView(NotesView, "desktop");
        expect(current()?.textContent).toContain(newest.title);
        expect(screen.getByRole("heading", { level: 1, name: newest.title })).toBeTruthy();
    });

    it("reads the note passed as item, with web page and LinkedIn links", () => {
        renderView(NotesView, "desktop", oldest.slug);
        expect(screen.getByRole("heading", { level: 1, name: oldest.title })).toBeTruthy();
        const web = screen.getAllByRole("link", { name: /Open as web page/ });
        expect(web[0].getAttribute("href")).toBe(`/blog/${oldest.slug}`);
        const li = screen.getByRole("link", { name: /Discuss on LinkedIn/ });
        expect(li.getAttribute("href")).toBe(oldest.linkedinUrl);
        expect(li.getAttribute("target")).toBe("_blank");
    });

    it("renders every body block type", () => {
        const withAll = posts.find((p) => ["h2", "ul", "quote"].every((t) => p.body.some((b) => b.type === t)));
        if (!withAll) return;
        const { container } = renderView(NotesView, "desktop", withAll.slug);
        expect(container.querySelector("article h2")).not.toBeNull();
        expect(container.querySelector("article blockquote")).not.toBeNull();
        expect(container.querySelector("article ul li")).not.toBeNull();
    });

    it("calls openItem with the slug when a note is clicked", () => {
        const { openItem } = renderView(NotesView, "desktop");
        fireEvent.click(screen.getByRole("button", { name: new RegExp(oldest.title.slice(0, 20)) }));
        expect(openItem).toHaveBeenCalledWith(oldest.slug);
    });

    it("falls back to the newest note for an unknown slug", () => {
        renderView(NotesView, "desktop", "not-a-post");
        expect(screen.getByRole("heading", { level: 1, name: newest.title })).toBeTruthy();
    });
});

describe("Notes — phone", () => {
    it("lists notes by year and pushes on tap", () => {
        const { openItem } = renderView(NotesView, "phone");
        expect(screen.getByRole("heading", { name: newest.date.slice(0, 4) })).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: new RegExp(newest.title.slice(0, 20)) }));
        expect(openItem).toHaveBeenCalledWith(newest.slug);
    });

    it("shows the reader for the item", () => {
        renderView(NotesView, "phone", oldest.slug);
        expect(screen.getByRole("heading", { level: 1, name: oldest.title })).toBeTruthy();
    });

    it("falls back to the list for an unknown slug", () => {
        renderView(NotesView, "phone", "not-a-post");
        expect(screen.queryByRole("heading", { level: 1 })).toBeNull();
        expect(screen.getAllByRole("button").length).toBe(posts.length);
    });
});
