/** Public surface of the Hidash OS core. Import from "@/lib/os" only (enforced by ESLint). */
export { os, createBus, type OsBus, type OsEvents, type Lifecycle, type ShareChannel } from "./bus";
export {
    parseOsUrl, serializeOsUrl, withOpened, withClosed, withFocused, EMPTY_STATE,
    type OsUrlState, type ShellKind,
} from "./url";
export { createOsHistory, browserHistoryPort, type OsHistory, type HistoryPort } from "./history";
export { useOsStore, type WindowGeometry, type OsMode } from "./store";
export { registerSpawnSurface, getSpawnRects, clearSpawnSurfaces, type SpawnKind, type SpawnRect } from "./spawn";
export { useSpawnSurface } from "./use-spawn-surface";
export { BOOT_SCRIPT, bootScript, markSeen, readShell } from "./boot-script";
export { OsProvider, useOs } from "./context";
