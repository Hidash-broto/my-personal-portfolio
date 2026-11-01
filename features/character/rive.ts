/**
 * Rive drop-in point for the final mini-Hidash art. Until the .riv exists this
 * returns null and Character keeps drawing <Figure/> (the SVG placeholder).
 *
 * TODO(character-art): when the Rive file from the reference video is approved:
 *
 * 1. Dependency: add `@rive-app/react-canvas-lite` (lite runtime, ~222KB gz vs ~567KB
 *    for the full canvas runtime). Import it ONLY via `await import(...)` inside
 *    `loadRiveCharacter`, so it stays out of both shells' first-load JS.
 *
 * 2. WASM, self-hosted (never unpkg): copy `node_modules/@rive-app/canvas-lite/rive.wasm`
 *    to `public/rive/rive-<exact package version>.wasm` (version-matched; bump it with the
 *    package), make sure it is served as `Content-Type: application/wasm`, and before the
 *    first render call:
 *        const { RuntimeLoader } = await import("@rive-app/react-canvas-lite");
 *        RuntimeLoader.setWasmUrl(`/rive/rive-${RIVE_VERSION}.wasm`);
 *    The .riv itself goes to `public/rive/hidash.riv` (cache-busted by filename).
 *
 * 3. When it loads (already wired in Character.tsx, keep it that way): after the visitor's
 *    first interaction (pointerdown / keydown), or after 3s idle following `boot:end`,
 *    whichever comes first. Never during the boot, never on the critical path.
 *
 * 4. State machine: one machine named RIVE_STATE_MACHINE with inputs that map 1:1 to
 *    `Pose` in machine.ts (the reducer stays the single source of truth; Rive only draws):
 *      - number input `pose`  = RIVE_POSE_INDEX[pose]  (idle, wave, point, type, celebrate, sleep, panic)
 *      - boolean input `walking` (desktop "Show me" walk; shown over the `point` pose)
 *      - boolean input `reduced` (prefers-reduced-motion: hold a static frame per pose)
 *    Blinking lives inside the Rive file (random 4-7s). The `hidden` state is not a Rive
 *    pose: Character simply doesn't render. Use `useStateMachineInput` per input and set
 *    `.value` in an effect when props change.
 *
 * 5. Fallback: if the import, the WASM fetch or the .riv load throws, resolve null
 *    (Character keeps the SVG). If it fails after mounting, the component calls
 *    `props.onError()` and Character swaps back to <Figure/>. Size the canvas to the same
 *    box as Figure (`height` prop; width from the artboard aspect) so nothing shifts.
 */
import type { ComponentType } from "react";
import type { Pose } from "./machine";

export const RIVE_STATE_MACHINE = "character";

/** Rive `pose` number input values. Keep in sync with the state machine in hidash.riv. */
export const RIVE_POSE_INDEX: Record<Pose, number> = {
    idle: 0,
    wave: 1,
    point: 2,
    type: 3,
    celebrate: 4,
    sleep: 5,
    panic: 6,
};

/** Same contract as <Figure/>, plus an error escape hatch back to the SVG. */
export interface RiveCharacterProps {
    pose: Pose;
    height: number;
    walking: boolean;
    bust: boolean;
    reduced: boolean;
    onError: () => void;
}

export interface RiveCharacter {
    Component: ComponentType<RiveCharacterProps>;
}

/**
 * Load the Rive character lazily. Resolves null while the art isn't ready, or on any failure.
 * Never rejects.
 */
export async function loadRiveCharacter(): Promise<RiveCharacter | null> {
    // Art not ready yet: keep the SVG placeholder. See the TODO above for the real loader.
    return null;
}
