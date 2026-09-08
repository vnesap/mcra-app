import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Generated components use data-ocid as their test id attribute.
configure({ testIdAttribute: "data-ocid" });

// Radix UI primitives (Dialog, Slider, Tooltip) rely on ResizeObserver, which
// jsdom does not implement.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverMock as unknown as typeof ResizeObserver;
}

// matchMedia is used by responsive UI helpers.
if (typeof window.matchMedia === "undefined") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
