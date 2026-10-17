// Lightweight client-side auth stub for the demo.
//
// There is no real session/auth layer yet, so "am I logged in?" is answered by
// a value in localStorage. Swap these helpers for real auth (Supabase Auth,
// cookies, etc.) later — the homepage only calls getUser() / clearUser().

const STORAGE_KEY = "zothydrate_user";

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setUser(user) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // storage full / disabled — ignore for the demo
  }
}

export function clearUser() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
