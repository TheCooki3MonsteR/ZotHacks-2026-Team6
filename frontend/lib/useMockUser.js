"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AUTH_EVENT, getCurrentUser, logout as apiLogout } from "./auth";

// Name used only for the design preview at /homepage?as=user (no real login).
const DEMO_USERNAME = "anteater_anna";

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
        u = { username: DEMO_USERNAME, displayName: "Anna Anteater" };
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
