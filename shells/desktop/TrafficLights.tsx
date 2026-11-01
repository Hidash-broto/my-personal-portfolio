"use client";

interface TrafficLightsProps {
    name: string;
    zoomed: boolean;
    canZoom: boolean;
    onClose: () => void;
    onMinimize: () => void;
    onZoom: () => void;
}

/** Close / minimize / zoom. Grey when the window is inactive; glyphs appear on hover (CSS). */
export function TrafficLights({ name, zoomed, canZoom, onClose, onMinimize, onZoom }: TrafficLightsProps) {
    return (
        <div className="hos-tl-group">
            <button type="button" className="hos-tl" data-tl="close" aria-label={`Close ${name}`} onClick={onClose}>
                <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3.9 3.9l4.2 4.2M8.1 3.9L3.9 8.1" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
                </svg>
            </button>
            <button type="button" className="hos-tl" data-tl="minimize" aria-label={`Minimize ${name}`} onClick={onMinimize}>
                <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3.2 6h5.6" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
            </button>
            <button
                type="button"
                className="hos-tl"
                data-tl="zoom"
                aria-label={zoomed ? `Restore ${name}` : `Zoom ${name}`}
                aria-pressed={zoomed}
                disabled={!canZoom}
                onClick={onZoom}
            >
                <svg viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M3.4 8.6V5.1l3.5 3.5H3.4z M8.6 3.4v3.5L5.1 3.4h3.5z" fill="currentColor" />
                </svg>
            </button>
        </div>
    );
}
