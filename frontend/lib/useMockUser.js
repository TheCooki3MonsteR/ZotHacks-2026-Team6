"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser, clearUser } from "./auth";

// Keeps multiple components (header, page) in sync about the mock session.
const AUTH_EVENT = "zothydrate:auth";

// The "logged in" demo identity. It maps to a seeded demo user so backend
// writes (visits, comments) have a valid user to attach to.
const DEMO_USERNAME = "anteater_anna";

function readUser() {
  const stored = getUser();
  if (stored) return { username: DEMO_USERNAME, ...stored };
  // Preview the logged-in design without real auth: /homepage?as=user
  if (
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("as") === "user"
  ) {
    return { username: DEMO_USERNAME, displayName: "Anna Anteater" };
  }
  return null;
}
import { AUTH_EVENT, getCurrentUser, logout as apiLogout } from "./auth";

// Despite the name (kept so other files don't need changes), this now reflects
// the REAL session: it asks the backend "who am I?" (/api/me).
export function useMockUser() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const sync = async () => {
      let u = await getCurrentUser();
      // Preview the logged-in design without logging in: /homepage?as=user
      if (!u && new URLSearchParams(window.location.search).get("as") === "user") {
        u = { username: "Anteater" };
      }
      if (!cancelled) setUser(u);
    };
    sync();
    window.addEventListener(AUTH_EVENT, sync);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_EVENT, sync);
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout(); // clears the cookie on the backend and fires AUTH_EVENT
    } catch {
      // even if the request fails, fall through and leave the page
    }
    setUser(null);
    router.push("/");
  }, [router]);

  return { user, loggedIn: Boolean(user), logout };
}
