"use client";

import { useSyncExternalStore } from "react";

// Anything at or below this CSS width is treated as a mobile layout.
export const MOBILE_MAX_WIDTH = 768;

const QUERY = `(max-width: ${MOBILE_MAX_WIDTH}px)`;
const MOBILE_UA = /Android|iPhone|iPad|iPod|Windows Phone|IEMobile|Opera Mini|Mobile/i;

function getQueryList() {
  if (typeof window === "undefined" || !window.matchMedia) return null;
  return window.matchMedia(QUERY);
}

// "Scan" the device for a mobile form factor: a narrow viewport OR a mobile
// user agent. Checking the UA keeps a phone in landscape (which is wider than
// the breakpoint) on the mobile layout.
export function detectMobile() {
  if (typeof window === "undefined") return false;
  const narrowViewport = getQueryList()?.matches ?? false;
  const mobileAgent = MOBILE_UA.test(navigator.userAgent ?? "");
  return narrowViewport || mobileAgent;
}

function subscribe(onChange) {
  const list = getQueryList();
  list?.addEventListener("change", onChange);
  window.addEventListener("resize", onChange);
  window.addEventListener("orientationchange", onChange);

  return () => {
    list?.removeEventListener("change", onChange);
    window.removeEventListener("resize", onChange);
    window.removeEventListener("orientationchange", onChange);
  };
}

// The server has no device to scan, so it renders the desktop layout; the
// client immediately switches to the mobile layout once it knows the device.
function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, detectMobile, getServerSnapshot);
}
