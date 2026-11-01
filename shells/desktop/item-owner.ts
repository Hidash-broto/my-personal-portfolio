import { create } from "zustand";
import type { WindowAppId } from "@/apps/registry";

/**
 * The URL carries one `item`, and focusing another window keeps it (withFocused). So the
 * desktop remembers which window wrote it: Builds keeps its selected build while Notes is
 * focused, and Notes never receives a Build id as a slug.
 */
interface ItemOwnerState {
    owner: WindowAppId | null;
    setOwner: (owner: WindowAppId | null) => void;
}

export const useItemOwner = create<ItemOwnerState>()((set) => ({
    owner: null,
    setOwner: (owner) => set({ owner }),
}));
