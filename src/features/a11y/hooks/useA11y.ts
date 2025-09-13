import { useEffect, useState } from "react";
import type { A11yState, ContrastMode } from "../types";

const KEY = "a11y:prefs";

// Clamp helper (kept local for treeshaking)
const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

// Default state (exported for reset if you ever need it elsewhere)
export const defaultState: A11yState = {
  largeText: false,
  reduceMotion: false,
  readingFont: false,
  underlineLinks: false,
  contrast: "none",
  fontScale: 1,
};

function readStoredState(): A11yState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<A11yState>;
    // Merge with defaults and clamp fontScale
    const merged: A11yState = {
      ...defaultState,
      ...parsed,
      fontScale: clamp(parsed.fontScale ?? defaultState.fontScale, 0.8, 2),
    };
    return merged;
  } catch {
    return defaultState;
  }
}

/** Apply classes + root font size to <html> based on state */
function applyToDom(state: A11yState) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  // Remove all possible classes first to avoid stacking
  root.classList.remove(
    "a11y-large-text",
    "a11y-reduce-motion",
    "a11y-reading-font",
    "a11y-underline-links",
    "a11y-high-contrast",
    "a11y-blue-contrast",
    "a11y-yellow-contrast"
  );

  // Booleans
  if (state.largeText) root.classList.add("a11y-large-text");
  if (state.reduceMotion) root.classList.add("a11y-reduce-motion");
  if (state.readingFont) root.classList.add("a11y-reading-font");
  if (state.underlineLinks) root.classList.add("a11y-underline-links");

  // Contrast (mutually exclusive)
  if (state.contrast === "high") root.classList.add("a11y-high-contrast");
  else if (state.contrast === "blue") root.classList.add("a11y-blue-contrast");
  else if (state.contrast === "yellow")
    root.classList.add("a11y-yellow-contrast");

  // Root font size for rem scaling
  root.style.fontSize = `${state.fontScale * 100}%`;
}

export function useA11y() {
  const [state, setState] = useState<A11yState>(() => readStoredState());

  // Whenever state changes, reflect to DOM + persist
  useEffect(() => {
    applyToDom(state);
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(state));
      }
    } catch {
      // Intentionally ignore storage errors (e.g., private mode/quota)
    }
  }, [state]);

  // Toggle any boolean key (type-safe: excludes non-booleans)
  function toggle<
    K extends "largeText" | "reduceMotion" | "readingFont" | "underlineLinks"
  >(key: K) {
    setState((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  // Set contrast (tap again to clear)
  function setContrast(mode: ContrastMode) {
    setState((prev) => ({
      ...prev,
      contrast: prev.contrast === mode ? "none" : mode, // tap again to clear
    }));
  }

  // Font scale controls
  function setFontScale(next: number) {
    setState((prev) => ({ ...prev, fontScale: clamp(next, 0.8, 2) }));
  }
  function stepFontScale(delta: number) {
    setFontScale(state.fontScale + delta);
  }
  function resetFontScale() {
    setFontScale(1);
  }

  // Reset everything to defaults
  function resetAll() {
    // 1) reset state
    setState(defaultState);
    // 2) immediately reflect in DOM (clears a11y-reduce-motion + font size)
    try {
      // applyToDom is in this file; call it directly
      applyToDom(defaultState);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(KEY, JSON.stringify(defaultState));
      }
    } catch {
      /* ignore */
    }
  }
  return {
    state,
    toggle,
    setContrast,
    setFontScale,
    stepFontScale,
    resetFontScale,
    resetAll,
  };
}
