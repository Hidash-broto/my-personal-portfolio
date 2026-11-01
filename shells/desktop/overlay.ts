/** At most one transient surface is open at a time (it is also the third live-blur surface). */
export type MenuId = "hidash" | "file" | "edit" | "view" | "window" | "help";

export type Overlay =
    | null
    | { kind: "menu"; id: MenuId; focusFirst: boolean }
    | { kind: "control" }
    | { kind: "search" };

export type SetOverlay = (next: Overlay | ((current: Overlay) => Overlay)) => void;
