/**
 * Where each app's Dock icon is, for windows that grow out of it and minimize into it.
 * Non-reactive (like the spawn registry): read only when an animation starts.
 */
const anchors = new Map<string, Element>();

export function registerDockAnchor(app: string, el: Element): () => void {
    anchors.set(app, el);
    return () => {
        if (anchors.get(app) === el) anchors.delete(app);
    };
}

export function dockAnchorRect(app: string): DOMRect | null {
    const el = anchors.get(app);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 ? rect : null;
}
