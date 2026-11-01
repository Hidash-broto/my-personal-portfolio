"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { createOsHistory, type OsHistory } from "./history";
import { parseOsUrl, type OsUrlState, type ShellKind } from "./url";

const URL_EVENT = "hos:url";

/** Browser port that also notifies subscribers after OS-driven URL changes. */
function notifyingPort() {
    const notify = () => window.dispatchEvent(new Event(URL_EVENT));
    return {
        current: () => window.location.pathname + window.location.search,
        push: (url: string) => {
            window.history.pushState(null, "", url);
            notify();
        },
        replace: (url: string) => {
            window.history.replaceState(null, "", url);
            notify();
        },
        back: () => window.history.back(),
    };
}

function subscribeUrl(callback: () => void) {
    window.addEventListener("popstate", callback);
    window.addEventListener(URL_EVENT, callback);
    return () => {
        window.removeEventListener("popstate", callback);
        window.removeEventListener(URL_EVENT, callback);
    };
}

interface OsContextValue {
    shell: ShellKind;
    history: OsHistory;
    url: OsUrlState;
}

const OsContext = createContext<OsContextValue | null>(null);

export function OsProvider({ shell, children }: { shell: ShellKind; children: ReactNode }) {
    const history = useMemo(() => createOsHistory(shell, notifyingPort()), [shell]);
    const search = useSyncExternalStore(subscribeUrl, () => window.location.search, () => "");
    const url = useMemo(() => parseOsUrl(search), [search]);

    useEffect(() => {
        history.landing();
        const onPop = () => history.onPopState();
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [history]);

    return <OsContext.Provider value={{ shell, history, url }}>{children}</OsContext.Provider>;
}

/** Shell, history controller and the current URL state. */
export function useOs(): OsContextValue {
    const value = useContext(OsContext);
    if (!value) throw new Error("useOs must be used inside <OsProvider>");
    return value;
}
