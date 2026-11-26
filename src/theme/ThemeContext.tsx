import {Theme} from "@navikt/ds-react";
import React, {useEffect, useState} from "react";
import {ResolvedTheme, ThemeContext, ThemePreference} from "./useTheme.ts";

const STORAGE_KEY = "satsviewer-theme";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

const readPreference = (): ThemePreference => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
    const [preference, setPreferenceState] = useState<ThemePreference>(readPreference);
    const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

    useEffect(() => {
        const query = darkQuery();
        const onChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
        query.addEventListener("change", onChange);
        return () => query.removeEventListener("change", onChange);
    }, []);

    const resolved: ResolvedTheme = preference === "system" ? (systemDark ? "dark" : "light") : preference;

    useEffect(() => {
        // Gir riktige scrollbarer, skjemakontroller og bakgrunn utenfor Theme-roten.
        document.documentElement.style.colorScheme = resolved;
        document.documentElement.dataset.theme = resolved;
    }, [resolved]);

    const setPreference = (next: ThemePreference) => {
        if (next === "system") localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, next);
        setPreferenceState(next);
    };

    return (
        <ThemeContext.Provider value={{preference, resolved, setPreference}}>
            <Theme theme={resolved} className="app-theme-root">
                {children}
            </Theme>
        </ThemeContext.Provider>
    );
};
