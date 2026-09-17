import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange) => {
    const media = window.matchMedia(query);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
};

const getSnapshot = () => window.matchMedia(query).matches;

export const usePrefersReducedMotion = () =>
    useSyncExternalStore(subscribe, getSnapshot, () => false);
