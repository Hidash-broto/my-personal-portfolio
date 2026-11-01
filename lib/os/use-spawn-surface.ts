"use client";

import { useEffect, type RefObject } from "react";
import { registerSpawnSurface, type SpawnKind } from "./spawn";

export function useSpawnSurface(id: string, kind: SpawnKind, ref: RefObject<Element | null>) {
    useEffect(() => {
        if (!ref.current) return;
        return registerSpawnSurface(id, kind, ref.current);
    }, [id, kind, ref]);
}
