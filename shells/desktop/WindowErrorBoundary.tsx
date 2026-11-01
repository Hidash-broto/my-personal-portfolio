"use client";

import { Component, type ReactNode } from "react";

/** One app crashing must never take the desktop down with it. */
export class WindowErrorBoundary extends Component<{ name: string; children: ReactNode }, { failed: boolean }> {
    state = { failed: false };

    static getDerivedStateFromError() {
        return { failed: true };
    }

    componentDidCatch(error: unknown) {
        console.error(`[hidash-os] ${this.props.name} crashed`, error);
    }

    render() {
        if (this.state.failed) {
            return (
                <div className="hos-window-fallback" role="alert">
                    <strong>{this.props.name} quit unexpectedly.</strong>
                    <span>Close the window and open it again.</span>
                </div>
            );
        }
        return this.props.children;
    }
}
