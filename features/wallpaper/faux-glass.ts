/** Class hook styled by features/wallpaper/faux-glass.css (imported by <Wallpaper>). */
export const FAUX_GLASS_CLASS = "hos-faux-glass";

/**
 * Offset mode for faux glass inside a transformed ancestor (dragged windows, swipeable pages): marks
 * the element and writes its viewport offset into `--hos-faux-x/y`. Call it on every frame the
 * element moves (drag, swipe, spring); it does one layout read and two style writes.
 */
export function syncFauxGlass(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    el.dataset.faux = "offset";
    el.style.setProperty("--hos-faux-x", `${rect.left}px`);
    el.style.setProperty("--hos-faux-y", `${rect.top}px`);
}
