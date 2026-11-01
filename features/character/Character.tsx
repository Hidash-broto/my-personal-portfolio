"use client";

/** STUB: the character lane replaces this (static pose + greeting bubble, Rive-ready). */
export default function Character({ shell }: { shell: "phone" | "desktop" }) {
    return <div data-character={shell} hidden />;
}
