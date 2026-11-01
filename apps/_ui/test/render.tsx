import { render } from "@testing-library/react";
import type { ComponentType } from "react";
import { vi } from "vitest";
import type { ShellKind } from "@/lib/os";
import type { AppViewProps } from "../../views";

/** Render an app view the way a shell does, with spies for the navigation callbacks. */
export function renderView(View: ComponentType<AppViewProps>, shell: ShellKind, item: string | null = null) {
    const openItem = vi.fn();
    const close = vi.fn();
    const openApp = vi.fn();
    const utils = render(<View shell={shell} item={item} openItem={openItem} close={close} openApp={openApp} />);
    const rerenderWith = (next: string | null) =>
        utils.rerender(<View shell={shell} item={next} openItem={openItem} close={close} openApp={openApp} />);
    return { ...utils, openItem, close, openApp, rerenderWith };
}
